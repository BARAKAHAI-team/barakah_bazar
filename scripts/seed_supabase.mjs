import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('--- Connecting to Supabase project ---');
  console.log('Project URL:', supabaseUrl);

  // Check if tables exist
  const { error: testErr } = await supabase.from('categories').select('id').limit(1);
  if (testErr) {
    console.error('\n⚠️  TABLES NOT FOUND IN SUPABASE:');
    console.error('Error message:', testErr.message);
    console.log('\n👉 HOW TO FIX:');
    console.log('1. Go to your Supabase Project Dashboard -> SQL Editor (in left sidebar).');
    console.log('2. Open the file: supabase/complete_setup.sql');
    console.log('3. Copy all contents, paste into Supabase SQL Editor, and click "Run" (▶).');
    console.log('4. That will create all tables, functions, RLS policies, and populate initial data instantly!\n');
    process.exit(1);
  }

  console.log('✅ Tables detected! Seeding/verifying initial catalog...');

  // 1. Categories
  const categories = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'bridal',
      name: 'Barakah Bridal Collections',
      tagline: 'Curated bridal couture, festive lehengas & embroidered suits',
      description: 'Exquisite bridal and festive ensembles crafted with intricate zari needlework, tilla embroidery, and rich royal silks.',
      sort_order: 1,
      is_active: true,
      seo_title: 'Barakah Bridal Collections | Royal Indian Festive & Wedding Wear',
      seo_description: 'Explore Barakah Bridal Collections: handcrafted bridal lehengas, festive suits, and heirloom wedding ensembles.',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      slug: 'naturals',
      name: 'Barakah Naturals',
      tagline: 'Artisanal scented candles & single-origin natural spices',
      description: 'Handcrafted luxury soy candles, bespoke aromatic gifts, and organic spices sourced directly from agricultural growers.',
      sort_order: 2,
      is_active: true,
      seo_title: 'Barakah Naturals | Luxury Scented Candles & Organic Spices',
      seo_description: 'Discover Barakah Naturals: artisanal soy wax candles, festive candle gift hampers, and single-origin Kerala spices.',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      slug: 'coconut-oil',
      name: 'Barakah Kerala Pure Coconut Oil',
      tagline: '100% pure & natural traditional cold-pressed Kerala coconut oil',
      description: 'Pure, unrefined coconut oil extracted from handpicked sun-dried Kerala copra for culinary, hair, and holistic wellness.',
      sort_order: 3,
      is_active: true,
      seo_title: 'Kerala Pure Coconut Oil | 100% Pure, Cold-Pressed & Unrefined',
      seo_description: 'Traditional Kerala coconut oil, cold-pressed and pure in convenient 300ml, 500ml, and 1 Litre packs.',
    },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
    if (error) console.warn(`Category ${cat.slug} error:`, error.message);
    else console.log(`✓ Category verified: ${cat.name}`);
  }

  // 2. Sample Banner
  const banner = {
    text: '✨ Grand Festive Launch: Free Delivery across India on all orders above ₹1,499!',
    highlight_text: 'LIMITED PERIOD',
    link_url: '/coconut-oil',
    badge_text: 'BARAKAH EXCLUSIVE',
    bg_color: '#0F3E2E',
    text_color: '#F9F6EE',
    is_active: true,
  };

  const { error: bErr } = await supabase.from('site_banners').insert(banner);
  if (bErr) console.warn('Banner note:', bErr.message);
  else console.log('✓ Active promotional banner seeded');

  console.log('\n🎉 Supabase database verification & seeding complete!');
}

seed().catch(console.error);
