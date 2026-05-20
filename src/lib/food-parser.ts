export interface ParsedFood {
  name: string;
  weight: number; // in grams
  raw: string;    // original text
}

/**
 * Parse a natural language food input string like:
 * "250g熟米饭 100g猪肉 50g土豆"
 * "一碗米饭 一个鸡蛋 200ml牛奶"
 * "米饭200g 鸡胸肉150g"
 */
export function parseFoodInput(input: string): ParsedFood[] {
  const results: ParsedFood[] = [];

  // Normalize: remove extra spaces, normalize separators
  const normalized = input
    .trim()
    .replace(/[，、;；]/g, " ") // Chinese separators → space
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (!normalized) return results;

  // Pattern: [weight][unit][food name]
  // e.g. "250g熟米饭", "100克猪肉", "200ml牛奶", "2个鸡蛋"
  const itemPattern = /(\d+\.?\d*)(g|克|kg|千克|ml|毫升|l|升|个|只|碗|杯|份|块|片|条)\s*([\u4e00-\u9fa5a-zA-Z]+)/g;

  // Pattern: [food name][weight][unit]
  // e.g. "米饭250g", "鸡胸肉150克"
  const reversePattern = /([\u4e00-\u9fa5a-zA-Z]+)\s*(\d+\.?\d*)(g|克|kg|千克|ml|毫升|l|升|个|只|碗|杯|份|块|片|条)/g;

  let match: RegExpExecArray | null;

  // Try first pattern: weight + unit + food name
  while ((match = itemPattern.exec(normalized)) !== null) {
    const weight = parseFloat(match[1]);
    const unit = match[2];
    const name = match[3];
    const grams = convertToGrams(weight, unit, name);
    results.push({ name, weight: grams, raw: match[0] });
  }

  // Try second pattern: food name + weight + unit (only if first pattern found nothing)
  if (results.length === 0) {
    while ((match = reversePattern.exec(normalized)) !== null) {
      const name = match[1];
      const weight = parseFloat(match[2]);
      const unit = match[3];
      const grams = convertToGrams(weight, unit, name);
      results.push({ name, weight: grams, raw: match[0] });
    }
  }

  return results;
}

function convertToGrams(weight: number, unit: string, foodName: string): number {
  switch (unit) {
    case "g":
    case "克":
      return weight;
    case "kg":
    case "千克":
      return weight * 1000;
    case "ml":
    case "毫升": {
      // Approximate: most foods are water-like density
      // Rice/porridge ~ 1.1-1.3 g/ml, milk ~ 1.03 g/ml
      if (foodName.includes("牛奶") || foodName.includes("奶")) return weight * 1.03;
      if (foodName.includes("豆浆")) return weight * 1.02;
      return weight * 1.0;
    }
    case "l":
    case "升":
      return weight * 1000;
    case "个": {
      // Common food portion estimates
      const portionSizes: Record<string, number> = {
        "鸡蛋": 50, "蛋": 50, "苹果": 200, "橙子": 200, "香蕉": 120,
        "橘子": 100, "梨": 200, "桃子": 150, "猕猴桃": 80, "芒果": 250,
        "馒头": 100, "包子": 80,
      };
      return portionSizes[foodName] || 100;
    }
    case "只": {
      if (foodName.includes("鸡翅")) return 50;
      if (foodName.includes("鸡腿")) return 150;
      if (foodName.includes("鸡蛋") || foodName.includes("蛋")) return 50;
      return 100;
    }
    case "碗": {
      if (foodName.includes("米饭") || foodName.includes("饭")) return 200; // ~200g rice per bowl
      if (foodName.includes("面条") || foodName.includes("面")) return 250;
      if (foodName.includes("粥")) return 300;
      return 250;
    }
    case "杯": {
      if (foodName.includes("牛奶") || foodName.includes("奶")) return 250;
      if (foodName.includes("酸奶")) return 200;
      if (foodName.includes("豆浆")) return 250;
      return 200;
    }
    case "块": {
      if (foodName.includes("蛋糕")) return 100;
      if (foodName.includes("巧克力")) return 20;
      if (foodName.includes("豆腐")) return 100;
      if (foodName.includes("牛肉") || foodName.includes("牛腩")) return 100;
      if (foodName.includes("排骨")) return 80;
      return 50;
    }
    case "片": {
      if (foodName.includes("面包")) return 30;
      if (foodName.includes("吐司")) return 30;
      if (foodName.includes("火腿")) return 20;
      if (foodName.includes("芝士") || foodName.includes("奶酪")) return 20;
      return 10;
    }
    case "条": {
      return 100;
    }
    default:
      return weight;
  }
}

/**
 * Fuzzy match a food name against the database.
 * Returns the best matching food name and whether it's an exact match.
 */
export function matchFoodName(
  inputName: string,
  foodNames: string[]
): { matched: string; exact: boolean } | null {
  const normalized = inputName.toLowerCase().trim();

  // Try exact match first
  const exact = foodNames.find(
    (f) => f.toLowerCase() === normalized
  );
  if (exact) return { matched: exact, exact: true };

  // Try contains match
  const contains = foodNames.find(
    (f) => f.toLowerCase().includes(normalized) || normalized.includes(f.toLowerCase())
  );
  if (contains) return { matched: contains, exact: false };

  // Try fuzzy: one-directional inclusion
  for (const name of foodNames) {
    const nameLower = name.toLowerCase();
    if (normalized.includes(nameLower) || nameLower.includes(normalized)) {
      const shorter = normalized.length < nameLower.length ? normalized : nameLower;
      const longer = normalized.length < nameLower.length ? nameLower : normalized;
      if (longer.startsWith(shorter)) {
        return { matched: name, exact: false };
      }
    }
  }

  return null;
}
