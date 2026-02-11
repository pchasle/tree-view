import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TARGET_ROWS = parseInt(process.argv[2] || '1000', 10);

const MODEL = {
  name: 'Classic T-Shirt',
  slug: 'tshirt_classic',
};

const SUBMODEL_AXES = [
  {
    attr: 'Color',
    attr_code: 'color',
    values: [
      'White', 'Black', 'Navy', 'Heather Grey', 'Red',
      'Forest Green', 'Sky Blue', 'Burgundy', 'Sand', 'Charcoal',
    ],
  },
  {
    attr: 'Fabric',
    attr_code: 'fabric',
    values: ['Cotton', 'Organic Cotton', 'Tri-Blend'],
  },
];

const VARIANT_AXES = [
  {
    attr: 'Size',
    attr_code: 'size',
    values: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  {
    attr: 'Fit',
    attr_code: 'fit',
    values: ['Regular', 'Slim', 'Relaxed', 'Tall'],
  },
  {
    attr: 'Neckline',
    attr_code: 'neckline',
    values: ['Crew', 'V-Neck', 'Henley'],
  },
];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cartesian(axes) {
  if (axes.length === 0) return [[]];
  const [first, ...rest] = axes;
  const restCombos = cartesian(rest);
  const result = [];
  for (const val of first.values) {
    for (const combo of restCombos) {
      result.push([{ attr: first.attr, attr_code: first.attr_code, value: val }, ...combo]);
    }
  }
  return result;
}

// Distribute `total` into `n` buckets, each between `min` and `max`, with randomness.
function distributeRandom(total, n, min, max) {
  if (n * min > total || n * max < total) {
    throw new Error(`Cannot distribute ${total} into ${n} buckets with min=${min}, max=${max}`);
  }

  // Start everyone at min, then distribute the remainder randomly
  const counts = new Array(n).fill(min);
  let remainder = total - n * min;

  // Build a pool of indices that can still receive more
  while (remainder > 0) {
    const eligible = [];
    for (let i = 0; i < n; i++) {
      if (counts[i] < max) eligible.push(i);
    }
    const idx = eligible[Math.floor(Math.random() * eligible.length)];
    const room = Math.min(max - counts[idx], remainder);
    const add = Math.floor(Math.random() * room) + 1;
    counts[idx] += add;
    remainder -= add;
  }

  return shuffle(counts);
}

function generateProducts() {
  const rows = [];
  let techId = 1;

  const submodelCombinations = cartesian(SUBMODEL_AXES);
  const variantCombinations = cartesian(VARIANT_AXES);
  const submodelCount = submodelCombinations.length;
  const maxVariantsPerSub = variantCombinations.length;

  const totalVariants = TARGET_ROWS - 1 - submodelCount;
  const variantCounts = distributeRandom(totalVariants, submodelCount, 1, maxVariantsPerSub);

  // Placeholder for the model row — we'll fill in totals after generating submodels
  const modelIndex = 0;
  rows.push({
    product_type: 'model',
    identifier: MODEL.slug,
    technical_id: String(techId++),
    label: MODEL.name,
    image: `https://picsum.photos/seed/${MODEL.slug}/200/200`,
    parent: null,
    complete_variant_products: { total: 0, complete: 0 },
  });

  let modelTotal = 0;
  let modelComplete = 0;

  // Submodels and their variants
  for (let i = 0; i < submodelCombinations.length; i++) {
    const subCombo = submodelCombinations[i];
    const subSuffix = subCombo.map(a => slugify(a.value)).join('_');
    const subIdentifier = `${MODEL.slug}_${subSuffix}`;
    const subLabel = `${MODEL.name} ${subCombo.map(a => a.value).join(' ')}`;

    const variantCount = variantCounts[i];
    const selectedVariants = shuffle(variantCombinations).slice(0, variantCount);

    const subComplete = Math.floor(Math.random() * (variantCount + 1));
    modelTotal += variantCount;
    modelComplete += subComplete;

    rows.push({
      product_type: 'submodel',
      identifier: subIdentifier,
      technical_id: String(techId++),
      label: subLabel,
      image: `https://picsum.photos/seed/${subIdentifier}/200/200`,
      parent: MODEL.slug,
      complete_variant_products: { total: variantCount, complete: subComplete },
      axes: subCombo.map(a => ({ attribute_code: a.attr_code, attribute_label: a.attr, axis_value: a.value })),
    });

    for (const varCombo of selectedVariants) {
      const varSuffix = varCombo.map(a => slugify(a.value)).join('_');
      const varIdentifier = `${subIdentifier}_${varSuffix}`;
      const varLabel = `${subLabel} ${varCombo.map(a => a.value).join(' ')}`;

      rows.push({
        product_type: 'variant',
        identifier: varIdentifier,
        technical_id: String(techId++),
        label: varLabel,
        image: `https://picsum.photos/seed/${varIdentifier}/200/200`,
        parent: subIdentifier,
        axes: varCombo.map(a => ({ attribute_code: a.attr_code, attribute_label: a.attr, axis_value: a.value })),
      });
    }
  }

  // Update model-level totals
  rows[modelIndex].complete_variant_products = { total: modelTotal, complete: modelComplete };

  return rows;
}

// Generate and write
const products = generateProducts();
const outputPath = join(__dirname, '..', 'src', 'components', 'product-models.json');
writeFileSync(outputPath, JSON.stringify(products, null, 2) + '\n');

// Print stats
const models = products.filter(p => p.product_type === 'model').length;
const submodels = products.filter(p => p.product_type === 'submodel').length;
const variants = products.filter(p => p.product_type === 'variant').length;
console.log(`Generated ${products.length} rows (target: ${TARGET_ROWS}):`);
console.log(`  - ${models} model`);
console.log(`  - ${submodels} submodels`);
console.log(`  - ${variants} variants`);
console.log(`Written to ${outputPath}`);
