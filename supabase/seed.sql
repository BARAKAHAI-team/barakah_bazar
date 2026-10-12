-- Seed Data for Barakah Bazaar
-- DEMO DATA TO BE REPLACED WITH REAL CLIENT DATA BEFORE PRODUCTION LAUNCH

-- -----------------------------------------------------------------------------
-- 1. Categories
-- -----------------------------------------------------------------------------
insert into public.categories (id, slug, name, tagline, description, sort_order, is_active, seo_title, seo_description)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'bridal',
    'Barakah Bridal Collections',
    'Curated bridal and occasion wear',
    'Handcrafted lehengas, sarees, and ensembles tailored for wedding celebrations.',
    1,
    true,
    'Bridal Wear & Wedding Collections | Barakah Bazaar',
    'Explore Barakah Bridal Collections: handcrafted bridal wear, lehengas, and sarees in bespoke sizes and colours.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'naturals',
    'Barakah Naturals',
    'Farm-direct natural products',
    'Single-origin natural spices and farm produce sourced directly from agricultural growers.',
    2,
    true,
    'Organic Spices & Farm Produce | Barakah Naturals',
    'Discover Barakah Naturals: single-origin turmeric powder, organic chilli powder, and farm-fresh natural staples.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'coconut-oil',
    'Barakah Kerala Pure Coconut Oil',
    'Traditional cold-pressed Kerala coconut oil',
    'Pure, unrefined coconut oil extracted from handpicked sun-dried Kerala copra.',
    3,
    true,
    'Kerala Pure Coconut Oil | Barakah Bazaar',
    '100% pure traditional Kerala coconut oil, unrefined and cold-pressed in convenient pack sizes.'
  )
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Bridal Products (5 products, XS-XL x 2 colours)
-- -----------------------------------------------------------------------------

-- Product 1: Zari Embroidered Silk Lehenga
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'zari-embroidered-silk-lehenga',
  'Zari Embroidered Silk Lehenga',
  'Classic bridal red and maroon lehenga with intricate gold zari embroidery.',
  'A classic bridal ensemble featuring rich hand-done zari needlework on pure raw silk. Comes with a matching embellished blouse piece and a sheer organza dupatta with scalloped borders. [DEMO DATA TO BE REPLACED]',
  '{"fabric": "Pure Raw Silk with Organza Dupatta", "work": "Hand Zari & Zardozi needlework", "care": "Strictly Dry Clean Only", "occasion": "Bride"}'::jsonb,
  array['Size', 'Colour'],
  'New',
  true
) on conflict do nothing;

-- Product 2: Handcrafted Velvet Bridal Anarkali
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'handcrafted-velvet-bridal-anarkali',
  'Handcrafted Velvet Bridal Anarkali',
  'Deep royal maroon velvet floor-length anarkali suit with antique tilla embroidery.',
  'Crafted from plush micro-velvet, this floor-grazing bridal anarkali features Mughal-inspired floral tilla motifs, fitted churidar, and an embellished net dupatta. [DEMO DATA TO BE REPLACED]',
  '{"fabric": "Micro Velvet & Net", "work": "Antique Tilla & Dabka Work", "care": "Dry Clean Only", "occasion": "Reception"}'::jsonb,
  array['Size', 'Colour'],
  null,
  true
) on conflict do nothing;

-- Product 3: Pastel Floral Organza Saree
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'pastel-floral-organza-saree',
  'Pastel Floral Organza Saree',
  'Delicate hand-painted organza saree with pearl and sequin borders.',
  'Designed for daytime celebrations, this sheer organza drape is accented with subtle pearl and mirror work along the edges. Includes unstitched blouse fabric. [DEMO DATA TO BE REPLACED]',
  '{"fabric": "Pure Silk Organza", "work": "Hand-painted floral motifs with pearl borders", "care": "Dry Clean Only", "occasion": "Mehendi"}'::jsonb,
  array['Size', 'Colour'],
  null,
  true
) on conflict do nothing;

-- Product 4: Mustard Georgette Sharara Set
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000004',
  '11111111-1111-1111-1111-111111111111',
  'mustard-georgette-sharara-set',
  'Mustard Georgette Sharara Set',
  'Vibrant three-piece sharara set with gota patti detailing for Haldi festivities.',
  'A lightweight festive choice in fluid georgette featuring traditional gota patti embellishments, flared multi-tiered sharara pants, and a scalloped dupatta. [DEMO DATA TO BE REPLACED]',
  '{"fabric": "Viscose Georgette", "work": "Traditional Gota Patti Work", "care": "Dry Clean Only", "occasion": "Haldi"}'::jsonb,
  array['Size', 'Colour'],
  'Popular',
  true
) on conflict do nothing;

-- Product 5: Emerald Green Reception Lehenga
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000005',
  '11111111-1111-1111-1111-111111111111',
  'emerald-green-reception-lehenga',
  'Emerald Green Reception Lehenga',
  'Opulent jewel-toned lehenga adorned with cutdana and matte metallic sequins.',
  'An evening reception showstopper tailored in rich satin-silk featuring structured flare, cutdana geometric embroidery, and a modern sweetheart-neck blouse. [DEMO DATA TO BE REPLACED]',
  '{"fabric": "Heavy Satin Silk", "work": "Cutdana & Sequin geometric hand embroidery", "care": "Dry Clean Only", "occasion": "Reception"}'::jsonb,
  array['Size', 'Colour'],
  null,
  true
) on conflict do nothing;

-- Variants for Bridal Products (XS, S, M, L, XL x 2 colours per product)
-- Product 1 Variants (Red & Maroon)
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-XS', 'XS / Bridal Red', '{"Size":"XS","Colour":"Bridal Red"}'::jsonb, 6800000, 7500000, 3, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-S',  'S / Bridal Red',  '{"Size":"S","Colour":"Bridal Red"}'::jsonb,  6800000, 7500000, 5, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-M',  'M / Bridal Red',  '{"Size":"M","Colour":"Bridal Red"}'::jsonb,  6800000, 7500000, 4, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-L',  'L / Bridal Red',  '{"Size":"L","Colour":"Bridal Red"}'::jsonb,  6800000, 7500000, 2, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-XL', 'XL / Bridal Red', '{"Size":"XL","Colour":"Bridal Red"}'::jsonb, 6800000, 7500000, 0, true), -- sold out variant
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-XS', 'XS / Deep Crimson', '{"Size":"XS","Colour":"Deep Crimson"}'::jsonb, 6800000, 7500000, 2, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-S',  'S / Deep Crimson',  '{"Size":"S","Colour":"Deep Crimson"}'::jsonb,  6800000, 7500000, 4, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-M',  'M / Deep Crimson',  '{"Size":"M","Colour":"Deep Crimson"}'::jsonb,  6800000, 7500000, 3, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-L',  'L / Deep Crimson',  '{"Size":"L","Colour":"Deep Crimson"}'::jsonb,  6800000, 7500000, 1, true), -- low stock (1)
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-XL', 'XL / Deep Crimson', '{"Size":"XL","Colour":"Deep Crimson"}'::jsonb, 6800000, 7500000, 2, true)
on conflict (sku) do nothing;

-- Product 2 Variants
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-XS', 'XS / Maroon', '{"Size":"XS","Colour":"Maroon"}'::jsonb, 4200000, 4800000, 4, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-S',  'S / Maroon',  '{"Size":"S","Colour":"Maroon"}'::jsonb,  4200000, 4800000, 6, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-M',  'M / Maroon',  '{"Size":"M","Colour":"Maroon"}'::jsonb,  4200000, 4800000, 3, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-L',  'L / Maroon',  '{"Size":"L","Colour":"Maroon"}'::jsonb,  4200000, 4800000, 2, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-XL', 'XL / Maroon', '{"Size":"XL","Colour":"Maroon"}'::jsonb, 4200000, 4800000, 0, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-XS', 'XS / Plum',   '{"Size":"XS","Colour":"Plum"}'::jsonb,   4200000, 4800000, 3, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-S',  'S / Plum',    '{"Size":"S","Colour":"Plum"}'::jsonb,    4200000, 4800000, 4, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-M',  'M / Plum',    '{"Size":"M","Colour":"Plum"}'::jsonb,    4200000, 4800000, 5, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-L',  'L / Plum',    '{"Size":"L","Colour":"Plum"}'::jsonb,    4200000, 4800000, 1, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-XL', 'XL / Plum',   '{"Size":"XL","Colour":"Plum"}'::jsonb,   4200000, 4800000, 2, true)
on conflict (sku) do nothing;

-- Product 3 Variants
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000003', 'BRD-SAR-BLS-FREE', 'Free Size / Blush Pink', '{"Size":"Free Size","Colour":"Blush Pink"}'::jsonb, 1850000, 2200000, 8, true),
  ('b1111111-0000-0000-0000-000000000003', 'BRD-SAR-PCH-FREE', 'Free Size / Soft Peach', '{"Size":"Free Size","Colour":"Soft Peach"}'::jsonb, 1850000, 2200000, 4, true)
on conflict (sku) do nothing;

-- Product 4 Variants
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MST-S', 'S / Mustard Yellow', '{"Size":"S","Colour":"Mustard Yellow"}'::jsonb, 2450000, 2800000, 5, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MST-M', 'M / Mustard Yellow', '{"Size":"M","Colour":"Mustard Yellow"}'::jsonb, 2450000, 2800000, 4, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MST-L', 'L / Mustard Yellow', '{"Size":"L","Colour":"Mustard Yellow"}'::jsonb, 2450000, 2800000, 2, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MNT-S', 'S / Mint Green',     '{"Size":"S","Colour":"Mint Green"}'::jsonb,     2450000, 2800000, 3, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MNT-M', 'M / Mint Green',     '{"Size":"M","Colour":"Mint Green"}'::jsonb,     2450000, 2800000, 6, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MNT-L', 'L / Mint Green',     '{"Size":"L","Colour":"Mint Green"}'::jsonb,     2450000, 2800000, 0, true)
on conflict (sku) do nothing;

-- Product 5 Variants
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-EMR-S', 'S / Emerald Green', '{"Size":"S","Colour":"Emerald Green"}'::jsonb, 8500000, 9500000, 3, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-EMR-M', 'M / Emerald Green', '{"Size":"M","Colour":"Emerald Green"}'::jsonb, 8500000, 9500000, 2, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-EMR-L', 'L / Emerald Green', '{"Size":"L","Colour":"Emerald Green"}'::jsonb, 8500000, 9500000, 1, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-NVY-S', 'S / Midnight Navy', '{"Size":"S","Colour":"Midnight Navy"}'::jsonb, 8500000, 9500000, 2, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-NVY-M', 'M / Midnight Navy', '{"Size":"M","Colour":"Midnight Navy"}'::jsonb, 8500000, 9500000, 3, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-NVY-L', 'L / Midnight Navy', '{"Size":"L","Colour":"Midnight Navy"}'::jsonb, 8500000, 9500000, 0, true)
on conflict (sku) do nothing;

-- Product 6: Royal Kundan & Pearl Bridal Choker Set
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000006',
  '11111111-1111-1111-1111-111111111111',
  'royal-kundan-pearl-bridal-choker-set',
  'Royal Kundan & Pearl Bridal Choker Set',
  'Handcrafted 24K gold-plated bridal choker necklace with matching jhumkas and maang tikka.',
  'An opulent bridal choker necklace handcrafted with high-grade uncut Kundan stones, green meenakari backing, and cascading freshwater pearls. Includes a grand choker, a pair of chandelier jhumka earrings, and a matha patti/maang tikka.',
  '{"fabric": "24K Micro Gold Plated Brass Alloy & Kundan", "work": "Hand-set Uncut Kundan & Pearl Clusters", "care": "Store in airtight velvet box. Keep away from water and direct perfume spray.", "occasion": "Bride", "sub_category": "Choker & Necklace Sets", "inclusions": "1 Choker Necklace, 1 Pair Jhumka Earrings, 1 Maang Tikka"}'::jsonb,
  array['Colour'],
  'Bestseller',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000006', 'ORN-KND-GLD-SET', 'Gold & Pearl White', '{"Colour":"Gold & Pearl White"}'::jsonb, 1850000, 2200000, 6, true),
  ('b1111111-0000-0000-0000-000000000006', 'ORN-KND-RUB-SET', 'Imperial Ruby & Green', '{"Colour":"Imperial Ruby & Green"}'::jsonb, 1850000, 2200000, 4, true)
on conflict (sku) do nothing;

-- Product 7: Antique Temple Gold Lakshmi Haram
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000007',
  '11111111-1111-1111-1111-111111111111',
  'antique-temple-gold-lakshmi-haram',
  'Antique Temple Gold Lakshmi Haram',
  'Heritage South Indian matte antique gold finish long necklace with Goddess Lakshmi motifs.',
  'Inspired by centuries-old Dravidian temple architecture, this long haram necklace features finely embossed Lakshmi motifs surrounded by peacocks and ruby cabochon stones. Complete with traditional jhumka earrings.',
  '{"fabric": "Antique Matte Gold Plated Brass & Temple Kemp Stones", "work": "Embossed Nakshi Temple Carving & Kemp Work", "care": "Wipe with soft chamois cloth after use. Avoid moisture.", "occasion": "Wedding", "sub_category": "Temple Jewellery", "inclusions": "1 Long Haram (24 Inches), 1 Pair Jhumkas"}'::jsonb,
  array['Colour'],
  'Heritage',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000007', 'ORN-TMP-GLD-FREE', 'Antique Matte Gold', '{"Colour":"Antique Matte Gold"}'::jsonb, 2400000, 2800000, 5, true),
  ('b1111111-0000-0000-0000-000000000007', 'ORN-TMP-RUB-FREE', 'Ruby Kemp Red & Gold', '{"Colour":"Ruby Kemp Red & Gold"}'::jsonb, 2400000, 2800000, 3, true)
on conflict (sku) do nothing;

-- Product 8: Meenakari Jadau Bridal Bangles Set
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000008',
  '11111111-1111-1111-1111-111111111111',
  'meenakari-jadau-bridal-bangles-set',
  'Meenakari Jadau Bridal Bangles (Set of 4)',
  'Traditional openable gold-plated bridal kadas adorned with intricate royal peacock enamel work.',
  'A luxurious set of four bridal kadas handcrafted in Jaipur, featuring vibrant red and green meenakari hand-painted work, pavé kundan detailing, and secure screw closures.',
  '{"fabric": "22K Micro Gold Plated Brass with Jaipur Meenakari", "work": "Hand-painted Enamel & Pavé Kundan Settings", "care": "Wipe clean with a dry cloth. Store in padded pouch.", "occasion": "Bride", "sub_category": "Bangles & Kadas", "inclusions": "Set of 4 Openable Screw Kadas"}'::jsonb,
  array['Size'],
  'Handcrafted',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000008', 'ORN-BNG-24', '2.4 (Small)', '{"Size":"2.4 (Small)"}'::jsonb, 1250000, 1500000, 6, true),
  ('b1111111-0000-0000-0000-000000000008', 'ORN-BNG-26', '2.6 (Medium)', '{"Size":"2.6 (Medium)"}'::jsonb, 1250000, 1500000, 8, true),
  ('b1111111-0000-0000-0000-000000000008', 'ORN-BNG-28', '2.8 (Large)', '{"Size":"2.8 (Large)"}'::jsonb, 1250000, 1500000, 4, true)
on conflict (sku) do nothing;

-- Product 9: Kundan Matha Patti & Crescent Maang Tikka
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000009',
  '11111111-1111-1111-1111-111111111111',
  'kundan-matha-patti-maang-tikka',
  'Kundan Matha Patti & Crescent Maang Tikka',
  'Multi-string pearl side-bands with an ornate crescent kundan centerpiece for wedding ceremonies.',
  'A statement bridal forehead ornament featuring delicate layers of tiny pearls framing the face and an intricate floral kundan centerpiece with hanging pearl clusters.',
  '{"fabric": "18K Yellow Gold Plated Alloy & Natural Seed Pearls", "work": "Polki Kundan Stone Setting & Pearl Stringing", "care": "Store flat in airtight box.", "occasion": "Bride", "sub_category": "Hair Ornaments", "inclusions": "1 Complete Matha Patti with side pearl strings"}'::jsonb,
  array['Colour'],
  'Popular',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000009', 'ORN-MTH-GLD', 'Pearl White & Gold', '{"Colour":"Pearl White & Gold"}'::jsonb, 780000, 950000, 7, true),
  ('b1111111-0000-0000-0000-000000000009', 'ORN-MTH-EMR', 'Emerald Green Accent', '{"Colour":"Emerald Green Accent"}'::jsonb, 780000, 950000, 5, true)
on conflict (sku) do nothing;

-- Product 10: Chandbali Kundan Bridal Drop Earrings
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000010',
  '11111111-1111-1111-1111-111111111111',
  'chandbali-kundan-bridal-drop-earrings',
  'Chandbali Kundan Bridal Drop Earrings',
  'Grand crescent-shaped chandelier earrings with hanging pearl drops and ruby accents.',
  'Mughal-inspired oversized chandbali earrings featuring delicate floral motifs, hand-set kundan work, and south sea pearl drops. Lightweight yet high impact for sangeet and reception.',
  '{"fabric": "Antique Gold Plated Brass & South Sea Pearls", "work": "Faceted Kundan & Ruby Quartz Drops", "care": "Keep in cotton-lined box.", "occasion": "Reception", "sub_category": "Earrings & Jhumkas", "inclusions": "1 Pair Chandbali Earrings with Ear Chains"}'::jsonb,
  array['Colour'],
  null,
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000010', 'ORN-EAR-GLD', 'Antique Gold & Pearl', '{"Colour":"Antique Gold & Pearl"}'::jsonb, 650000, 800000, 8, true),
  ('b1111111-0000-0000-0000-000000000010', 'ORN-EAR-RUB', 'Ruby Red & Pearl', '{"Colour":"Ruby Red & Pearl"}'::jsonb, 650000, 800000, 6, true)
on conflict (sku) do nothing;

-- Product 11: Banarasi Katan Silk Bridal Saree
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000011',
  '11111111-1111-1111-1111-111111111111',
  'banarasi-katan-silk-bridal-saree',
  'Banarasi Katan Silk Bridal Saree',
  'Heirloom handwoven pure silk saree adorned with intricate Kadwa gold zari floral jaal.',
  'Woven on traditional handlooms in Varanasi by master weavers over 45 days. Features pure Katan silk in deep vermilion red, dense floral kadwa jangla weave in real gold-tested zari, and an unstitched heavy brocade blouse piece.',
  '{"fabric": "100% Pure Katan Silk Handloom", "work": "Traditional Kadwa Gold Zari Floral Jaal", "care": "Dry Clean Only. Preserve wrapped in pure muslin cloth.", "occasion": "Bride / Muhurtham", "sub_category": "Lehengas & Sarees", "inclusions": "6.5 Metres Saree with Unstitched Contrast Blouse Piece"}'::jsonb,
  array['Colour'],
  'Masterpiece',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000011', 'BRD-BAN-RED', 'Vermilion Bridal Red', '{"Colour":"Vermilion Bridal Red"}'::jsonb, 3400000, 3950000, 4, true),
  ('b1111111-0000-0000-0000-000000000011', 'BRD-BAN-MRN', 'Imperial Maroon Zari', '{"Colour":"Imperial Maroon Zari"}'::jsonb, 3400000, 3950000, 3, true)
on conflict (sku) do nothing;

-- Product 12: Jadau Polki Heritage Navratan Choker Set
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000012',
  '11111111-1111-1111-1111-111111111111',
  'jadau-polki-heritage-navratan-choker-set',
  'Jadau Polki Heritage Navratan Choker Set',
  'Royal Rajasthani 9-gemstone necklace handcrafted with uncut polki and emerald drops.',
  'An auspicious Navratan masterpiece embodying royal Indian heritage. Features uncut polki stones set in foil, nine planetary gemstones, ruby cabochons, and hand-strung natural seed pearls with matching drop earrings.',
  '{"fabric": "22K Micro Gold Plated Brass & Navratan Gemstones", "work": "Open Foil Jadau Setting with Emerald Bead Drops", "care": "Keep in cotton-lined box away from moisture.", "occasion": "Wedding / Sangeet", "sub_category": "Choker & Necklace Sets", "inclusions": "1 Navratan Choker, 1 Pair Navratan Jhumkas"}'::jsonb,
  array['Style'],
  'Heritage',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000012', 'ORN-NAV-STD', 'Classic Navratan Multi-gem', '{"Style":"Classic Navratan Multi-gem"}'::jsonb, 2650000, 3100000, 5, true)
on conflict (sku) do nothing;

-- -----------------------------------------------------------------------------
-- 3. Naturals Products (6 products with 3 pack-size variants each)
-- -----------------------------------------------------------------------------

-- Product 1: Farm Turmeric Powder
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'n2222222-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'organic-turmeric-powder',
  'Organic Turmeric Powder',
  'High-curcumin single-origin ground turmeric root sourced from Wayanad farmers.',
  'Pure golden turmeric ground from sun-cured rhizomes. Free from artificial colour, starch additives, or preservatives. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Wayanad, Kerala", "ingredients": "100% Sun-dried Turmeric Rhizomes (Curcuma longa)", "shelf_life": "12 months from packing"}'::jsonb,
  array['Pack size'],
  'Bestseller',
  true
) on conflict do nothing;

-- Product 2: Farm Chilli Powder
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'n2222222-0000-0000-0000-000000000002',
  '22222222-2222-2222-2222-222222222222',
  'organic-chilli-powder',
  'Organic Chilli Powder',
  'Sun-dried stone-ground red chillies offering natural heat and vibrant colour.',
  'Made from stemless ripe red chillies dried under direct sunlight and slowly ground to retain natural capsaicin and oils. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Guntur & Byadgi, India", "ingredients": "100% Whole Sun-dried Red Chillies", "shelf_life": "9 months from packing"}'::jsonb,
  array['Pack size'],
  null,
  true
) on conflict do nothing;

-- Product 3: Tellicherry Black Peppercorns
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'n2222222-0000-0000-0000-000000000003',
  '22222222-2222-2222-2222-222222222222',
  'tellicherry-black-peppercorns',
  'Tellicherry Black Peppercorns',
  'Extra bold whole black pepper berries harvested from Malabar coast estates.',
  'Hand-sorted extra-bold black peppercorns renowned for deep woodsy aroma and sharp lingering heat. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Malabar Coast, Kerala", "ingredients": "100% Whole Black Peppercorns", "shelf_life": "24 months from packing"}'::jsonb,
  array['Pack size'],
  null,
  true
) on conflict do nothing;

-- Product 4: Green Cardamom Pods
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'n2222222-0000-0000-0000-000000000004',
  '22222222-2222-2222-2222-222222222222',
  'green-cardamom-pods',
  'Green Cardamom Pods',
  'Aromatic 8mm bold green cardamom pods from the Cardamom Hills.',
  'Fragrant whole green cardamom selected for plump seeds and high essential oil content. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Idukki, Kerala", "ingredients": "100% Whole Green Cardamom", "shelf_life": "18 months from packing"}'::jsonb,
  array['Pack size'],
  null,
  true
) on conflict do nothing;

-- Product 5: Raw Forest Honey
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'n2222222-0000-0000-0000-000000000005',
  '22222222-2222-2222-2222-222222222222',
  'raw-forest-honey',
  'Raw Forest Honey',
  'Unprocessed multi-floral honey harvested from Western Ghats wild hives.',
  'Unpasteurised, unfiltered wild honey retaining natural pollens and enzymes. Never adulterated with corn or rice syrup. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Nilgiri Biosphere, Western Ghats", "ingredients": "100% Raw Wild Honey", "shelf_life": "24 months (natural crystallization may occur)"}'::jsonb,
  array['Pack size'],
  'New',
  true
) on conflict do nothing;

-- Product 6: Dry Ginger Powder (Chukku)
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'n2222222-0000-0000-0000-000000000006',
  '22222222-2222-2222-2222-222222222222',
  'dry-ginger-powder',
  'Dry Ginger Powder (Chukku)',
  'Traditional stone-milled dried ginger root with intense warmth.',
  'Prepared from peeled and sun-cured Kerala ginger rhizomes, ideal for traditional beverages and culinary seasoning. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Ernakulam, Kerala", "ingredients": "100% Sun-dried Ginger Root", "shelf_life": "12 months from packing"}'::jsonb,
  array['Pack size'],
  null,
  true
) on conflict do nothing;

-- Variants for Naturals Products (100g, 250g, 500g)
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, net_quantity, net_unit, is_active)
values
  -- Turmeric
  ('n2222222-0000-0000-0000-000000000001', 'NAT-TUR-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 8500,  10000, 25, 100, 'g', true),
  ('n2222222-0000-0000-0000-000000000001', 'NAT-TUR-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 19500, 23000, 18, 250, 'g', true),
  ('n2222222-0000-0000-0000-000000000001', 'NAT-TUR-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 36000, 42000, 10, 500, 'g', true),
  -- Chilli
  ('n2222222-0000-0000-0000-000000000002', 'NAT-CHL-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 9500,  11000, 30, 100, 'g', true),
  ('n2222222-0000-0000-0000-000000000002', 'NAT-CHL-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 22000, 26000, 15, 250, 'g', true),
  ('n2222222-0000-0000-0000-000000000002', 'NAT-CHL-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 41000, 48000, 8,  500, 'g', true),
  -- Black Pepper
  ('n2222222-0000-0000-0000-000000000003', 'NAT-PEP-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 18000, 21000, 20, 100, 'g', true),
  ('n2222222-0000-0000-0000-000000000003', 'NAT-PEP-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 42000, 49000, 12, 250, 'g', true),
  ('n2222222-0000-0000-0000-000000000003', 'NAT-PEP-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 79000, 92000, 4,  500, 'g', true),
  -- Cardamom
  ('n2222222-0000-0000-0000-000000000004', 'NAT-CRD-50G',  '50 g',  '{"Pack size":"50 g"}'::jsonb,  24000, 28000, 15, 50,  'g', true),
  ('n2222222-0000-0000-0000-000000000004', 'NAT-CRD-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 46000, 52000, 10, 100, 'g', true),
  ('n2222222-0000-0000-0000-000000000004', 'NAT-CRD-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 108000,120000,3, 250, 'g', true),
  -- Raw Forest Honey (ml / g)
  ('n2222222-0000-0000-0000-000000000005', 'NAT-HNY-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 28000, 32000, 14, 250, 'g', true),
  ('n2222222-0000-0000-0000-000000000005', 'NAT-HNY-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 52000, 59000, 8,  500, 'g', true),
  ('n2222222-0000-0000-0000-000000000005', 'NAT-HNY-1000G','1 kg',  '{"Pack size":"1 kg"}'::jsonb,  98000, 110000,2,  1000,'g', true),
  -- Dry Ginger Powder
  ('n2222222-0000-0000-0000-000000000006', 'NAT-GNG-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 12000, 14000, 20, 100, 'g', true),
  ('n2222222-0000-0000-0000-000000000006', 'NAT-GNG-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 27500, 31000, 12, 250, 'g', true),
  ('n2222222-0000-0000-0000-000000000006', 'NAT-GNG-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 51000, 58000, 0,  500, 'g', true)
on conflict (sku) do nothing;

-- Product 7: Pure Kashmiri Mongra Saffron
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'n2222222-0000-0000-0000-000000000007',
  '22222222-2222-2222-2222-222222222222',
  'kashmiri-mongra-pure-saffron',
  'Grade-A1 Pure Kashmiri Mongra Saffron (Kesar)',
  'Certified Grade-A1 deep crimson saffron stigmas sourced directly from Pampore farms.',
  'Authentic Kashmir Mongra saffron hand-harvested from Crocus sativus flowers in Pampore valleys. Deep red whole stigmas with intense floral aroma, natural golden infusion, and lab-tested high crocin content. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Pampore, Kashmir", "ingredients": "100% Pure Mongra Saffron Stigmas", "shelf_life": "24 months in airtight container away from light"}'::jsonb,
  array['Pack size'],
  'Pure Heritage',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, net_quantity, net_unit, is_active)
values
  ('n2222222-0000-0000-0000-000000000007', 'NAT-SAF-1G', '1 g', '{"Pack size":"1 g"}'::jsonb, 55000, 65000, 25, 1, 'g', true),
  ('n2222222-0000-0000-0000-000000000007', 'NAT-SAF-5G', '5 g', '{"Pack size":"5 g"}'::jsonb, 240000, 280000, 10, 5, 'g', true)
on conflict (sku) do nothing;

-- -----------------------------------------------------------------------------
-- 4. Coconut Oil Products (4 products with variants)
-- -----------------------------------------------------------------------------

-- Product 1: Pure Cold-Pressed Coconut Oil
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'c3333333-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333333',
  'pure-cold-pressed-coconut-oil',
  'Pure Cold-Pressed Coconut Oil',
  '100% unrefined cold-pressed oil made from sulfur-free sun-dried Kerala copra.',
  'Extracted through wooden expellers without chemical solvents or heat treatment. Delivers authentic aroma for cooking, skin, and hair nourishing. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Kozhikode & Malappuram, Kerala", "process": "Traditional Wooden Marachekku Cold Press", "ingredients": "100% Pure Coconut Oil (Cocos nucifera)", "shelf_life": "12 months from packing"}'::jsonb,
  array['Pack size'],
  'Pure Kerala',
  true
) on conflict do nothing;

-- Product 2: Traditional Roasted Coconut Oil (Uruli)
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'c3333333-0000-0000-0000-000000000002',
  '33333333-3333-3333-3333-333333333333',
  'traditional-roasted-coconut-oil',
  'Traditional Roasted Coconut Oil (Uruli)',
  'Artisanal roasted coconut oil slowly simmered in bronze urulis for distinct aroma.',
  'Crafted in small batches according to age-old Kerala kitchen heritage. Gives traditional curries their characteristic nutty fragrance. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Central Travancore, Kerala", "process": "Slow bronze uruli extraction", "ingredients": "100% Roasted Coconut Kernel Extract", "shelf_life": "12 months from packing"}'::jsonb,
  array['Pack size'],
  null,
  true
) on conflict do nothing;

-- Product 3: Wood-Pressed Extra Virgin Coconut Oil
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'c3333333-0000-0000-0000-000000000003',
  '33333333-3333-3333-3333-333333333333',
  'wood-pressed-marachekku-virgin-coconut-oil',
  'Wood-Pressed (Marachekku) Extra Virgin Coconut Oil',
  'Extracted in traditional stone-wood vats at ambient room temperature to preserve natural antioxidants.',
  'Crafted using traditional Kerala Vaagai wood expellers (Marachekku). The copra is cold-pressed slowly without heating or metal friction, preserving maximum lauric acid, natural scent, and delicate nutrients. Ideal for raw consumption, baby massage, and skin wellness. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Malabar Coast, Kerala", "process": "Traditional Marachekku Wood Press", "ingredients": "100% Raw Virgin Coconut Oil", "shelf_life": "12 months from packing"}'::jsonb,
  array['Pack size'],
  'Artisanal',
  true
) on conflict do nothing;

-- Product 4: Ayurvedic Bhringraj Herbal Hair Oil
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'c3333333-0000-0000-0000-000000000004',
  '33333333-3333-3333-3333-333333333333',
  'ayurvedic-bhringraj-brahmi-herbal-hair-oil',
  'Ayurvedic Bhringraj & Brahmi Herbal Coconut Hair Oil',
  'Infused with 12 wild Ayurvedic botanicals simmered in pure Kerala coconut milk oil for hair nourishment.',
  'Prepared through the classical Taila Paka Vidhi. Fresh cold-pressed coconut oil is slowly decocted with Bhringraj (False Daisy), Brahmi, Hibiscus petals, Amla, and Vetiver roots to promote deep root strength, reduce hair fall, and provide cooling relaxation. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Palakkad, Kerala", "process": "Traditional Ayurvedic Kashayam Decoction", "ingredients": "Pure Coconut Oil, Bhringraj, Brahmi, Hibiscus, Amla, Fenugreek, Vetiver", "shelf_life": "18 months from packing"}'::jsonb,
  array['Pack size'],
  'Ayurvedic',
  true
) on conflict do nothing;

-- Coconut Oil Variants (250 ml, 500 ml, 1 L)
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, net_quantity, net_unit, is_active)
values
  -- Cold Pressed
  ('c3333333-0000-0000-0000-000000000001', 'OIL-CLD-250ML', '250 ml', '{"Pack size":"250 ml"}'::jsonb, 19000, 22000, 40, 250, 'ml', true),
  ('c3333333-0000-0000-0000-000000000001', 'OIL-CLD-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 35000, 40000, 28, 500, 'ml', true),
  ('c3333333-0000-0000-0000-000000000001', 'OIL-CLD-1000ML','1 L',    '{"Pack size":"1 L"}'::jsonb,    67000, 75000, 15, 1000,'ml', true),
  -- Roasted Uruli
  ('c3333333-0000-0000-0000-000000000002', 'OIL-RST-250ML', '250 ml', '{"Pack size":"250 ml"}'::jsonb, 24000, 27500, 22, 250, 'ml', true),
  ('c3333333-0000-0000-0000-000000000002', 'OIL-RST-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 44000, 49000, 18, 500, 'ml', true),
  ('c3333333-0000-0000-0000-000000000002', 'OIL-RST-1000ML','1 L',    '{"Pack size":"1 L"}'::jsonb,    84000, 92000, 8,  1000,'ml', true),
  -- Wood Pressed Virgin
  ('c3333333-0000-0000-0000-000000000003', 'OIL-WOD-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 38000, 44000, 30, 500, 'ml', true),
  ('c3333333-0000-0000-0000-000000000003', 'OIL-WOD-1000ML','1 L',    '{"Pack size":"1 L"}'::jsonb,    72000, 82000, 16, 1000,'ml', true),
  -- Ayurvedic Hair Oil
  ('c3333333-0000-0000-0000-000000000004', 'OIL-AYU-200ML', '200 ml', '{"Pack size":"200 ml"}'::jsonb, 45000, 52000, 35, 200, 'ml', true),
  ('c3333333-0000-0000-0000-000000000004', 'OIL-AYU-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 82000, 95000, 18, 500, 'ml', true)
on conflict (sku) do nothing;

-- -----------------------------------------------------------------------------
-- 5. Product Images (Placeholder records with NULL storage_path)
-- -----------------------------------------------------------------------------
insert into public.product_images (product_id, storage_path, alt, sort_order, is_primary)
select
  p.id,
  null,
  p.name,
  0,
  true
from public.products p
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- 6. Coupons (3 coupons: percentage with cap, flat, expired)
-- -----------------------------------------------------------------------------
insert into public.coupons (code, type, value, max_discount_paise, min_order_paise, valid_from, valid_to, is_active, used_count)
values
  (
    'WELCOME10',
    'PERCENT',
    10,               -- 10% discount
    200000,           -- Cap of ₹2,000 (200000 paise)
    100000,           -- Min order of ₹1,000 (100000 paise)
    now() - interval '30 days',
    now() + interval '365 days',
    true,
    0
  ),
  (
    'FLAT500',
    'FLAT',
    50000,            -- Flat ₹500 discount (50000 paise)
    null,
    250000,           -- Min order of ₹2,500 (250000 paise)
    now() - interval '30 days',
    now() + interval '365 days',
    true,
    0
  ),
  (
    'EXPIRED20',
    'PERCENT',
    20,               -- 20% discount
    100000,
    50000,
    now() - interval '60 days',
    now() - interval '1 day',   -- Expired yesterday for testing validation
    true,
    0
  )
on conflict (code) do nothing;
