import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Single product model: "Classic T-Shirt" with realistic axis combinations
// Submodel axes: Color × Fabric (10 × 3 = 30 submodels)
// Variant axes: Size × Fit (8 × 4 = 32 possible variants)
// Each submodel gets a random subset of 1–32 variants, so row count varies per run

const MODEL = {
  name: 'Classic T-Shirt',
  slug: 'tshirt_classic',
};

const SUBMODEL_AXES = [
  {
    attr: 'Color',
    values: [
      'White', 'Black', 'Navy', 'Heather Grey', 'Red',
      'Forest Green', 'Sky Blue', 'Burgundy', 'Sand', 'Charcoal',
    ],
  },
  {
    attr: 'Fabric',
    values: ['Cotton', 'Organic Cotton', 'Tri-Blend'],
  },
];

const VARIANT_AXES = [
  {
    attr: 'Size',
    values: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  {
    attr: 'Fit',
    values: ['Regular', 'Slim', 'Relaxed', 'Tall'],
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
      result.push([{ attr: first.attr, value: val }, ...combo]);
    }
  }
  return result;
}

function generateProducts() {
  const rows = [];
  let techId = 1;

  const submodelCombinations = cartesian(SUBMODEL_AXES);
  const variantCombinations = cartesian(VARIANT_AXES);

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
  for (const subCombo of submodelCombinations) {
    const subSuffix = subCombo.map(a => slugify(a.value)).join('_');
    const subIdentifier = `${MODEL.slug}_${subSuffix}`;
    const subLabel = `${MODEL.name} ${subCombo.map(a => a.value).join(' ')}`;

    // Each submodel gets a random subset of variant combinations (at least 1)
    const variantCount = Math.floor(Math.random() * variantCombinations.length) + 1;
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
      axes: subCombo.map(a => ({ attribute_label: a.attr, axis_value: a.value })),
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
        axes: varCombo.map(a => ({ attribute_label: a.attr, axis_value: a.value })),
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
console.log(`Generated ${products.length} rows:`);
console.log(`  - ${models} model`);
console.log(`  - ${submodels} submodels`);
console.log(`  - ${variants} variants`);
console.log(`Written to ${outputPath}`);
