import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Single product model: "Classic T-Shirt" with realistic axis combinations
// Submodel axes: Color × Fabric (10 × 3 = 30 submodels)
// Variant axes: Size × Fit (8 × 4 = 32 variants per submodel)
// Total: 1 + 30 + 30×32 = 991 rows

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

  const totalVariants = submodelCombinations.length * variantCombinations.length;
  const completeCount = Math.floor(Math.random() * (totalVariants + 1));

  // Single model
  rows.push({
    product_type: 'model',
    identifier: MODEL.slug,
    technical_id: String(techId++),
    label: MODEL.name,
    image: `https://picsum.photos/seed/${MODEL.slug}/200/200`,
    parent: null,
    complete_variant_products: { total: totalVariants, complete: completeCount },
  });

  // Submodels and their variants
  for (const subCombo of submodelCombinations) {
    const subSuffix = subCombo.map(a => slugify(a.value)).join('_');
    const subIdentifier = `${MODEL.slug}_${subSuffix}`;
    const subLabel = `${MODEL.name} ${subCombo.map(a => a.value).join(' ')}`;

    const subComplete = Math.floor(Math.random() * (variantCombinations.length + 1));

    rows.push({
      product_type: 'submodel',
      identifier: subIdentifier,
      technical_id: String(techId++),
      label: subLabel,
      image: `https://picsum.photos/seed/${subIdentifier}/200/200`,
      parent: MODEL.slug,
      complete_variant_products: { total: variantCombinations.length, complete: subComplete },
      axes: subCombo.map(a => ({ attribute_label: a.attr, axis_value: a.value })),
    });

    for (const varCombo of variantCombinations) {
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
