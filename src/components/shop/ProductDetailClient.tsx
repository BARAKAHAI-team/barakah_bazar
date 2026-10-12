'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { CatalogProduct, CatalogVariant } from '@/lib/catalog/types';
import { Price } from '@/components/ui/Price';
import { UnitPrice } from '@/components/ui/UnitPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { OptionPicker } from '@/components/ui/OptionPicker';
import { Swatch } from '@/components/ui/Swatch';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';
import { SITE_CONFIG } from '@/lib/config/site';

export interface ProductDetailClientProps {
  product: CatalogProduct;
  initialReviews: any[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  initialReviews,
}) => {
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<CatalogVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isBridal = product.category_slug === 'bridal';

  // Stock status
  const stock = selectedVariant.stock;
  const isSoldOut = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const discountPercent =
    selectedVariant.compare_at_price_paise &&
    selectedVariant.compare_at_price_paise > selectedVariant.price_paise
      ? Math.round(
          ((selectedVariant.compare_at_price_paise - selectedVariant.price_paise) /
            selectedVariant.compare_at_price_paise) *
            100
        )
      : 0;

  const isNew = product.created_at
    ? Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  // Options parsing
  const sizes = Array.from(
    new Set(product.variants.map((v) => v.option_values['Size']).filter(Boolean))
  );
  const colours = Array.from(
    new Set(product.variants.map((v) => v.option_values['Colour']).filter(Boolean))
  );
  const packSizes = Array.from(
    new Set(product.variants.map((v) => v.option_values['Pack size']).filter(Boolean))
  );

  const handleSizeChange = (newSize: string) => {
    const currentColor = selectedVariant.option_values['Colour'];
    const matched =
      product.variants.find(
        (v) => v.option_values['Size'] === newSize && v.option_values['Colour'] === currentColor
      ) ||
      product.variants.find((v) => v.option_values['Size'] === newSize) ||
      product.variants[0];

    setSelectedVariant(matched);
    if (quantity > matched.stock && matched.stock > 0) {
      setQuantity(matched.stock);
    }
  };

  const handleColourChange = (newColour: string) => {
    const currentSize = selectedVariant.option_values['Size'];
    const matched =
      product.variants.find(
        (v) => v.option_values['Colour'] === newColour && v.option_values['Size'] === currentSize
      ) ||
      product.variants.find((v) => v.option_values['Colour'] === newColour) ||
      product.variants[0];

    setSelectedVariant(matched);
    if (quantity > matched.stock && matched.stock > 0) {
      setQuantity(matched.stock);
    }
  };

  const handlePackSizeChange = (newPack: string) => {
    const matched =
      product.variants.find((v) => v.option_values['Pack size'] === newPack) ||
      product.variants[0];
    setSelectedVariant(matched);
    if (quantity > matched.stock && matched.stock > 0) {
      setQuantity(matched.stock);
    }
  };

  const handleAddToCart = async () => {
    if (isSoldOut) return;

    if (!clientStore.isLoggedIn) {
      sessionStorage.setItem(
        'bz_pending_action',
        JSON.stringify({
          type: 'cart',
          variantId: selectedVariant.id,
          qty: quantity,
        })
      );
      toast('Please log in to add items to your cart.', 'info');
      window.location.href = `/login?next=/${product.category_slug}/${product.slug}`;
      return;
    }

    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          qty: quantity,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.error?.message || 'Failed to add item to cart', 'error');
      } else {
        clientStore.setCartCount(clientStore.cartCount + quantity);
        toast(`Added ${quantity} item(s) to your cart.`, 'success');
      }
    } catch {
      toast('Error communicating with server', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!clientStore.isLoggedIn) {
      sessionStorage.setItem(
        'bz_pending_action',
        JSON.stringify({ type: 'wishlist', productId: product.id })
      );
      toast('Please log in to save items to your wishlist.', 'info');
      window.location.href = `/login?next=/${product.category_slug}/${product.slug}`;
      return;
    }

    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      clientStore.setWishlistCount(clientStore.wishlistCount + 1);
      toast('Added to wishlist', 'success');
    } catch {
      toast('Unable to update wishlist', 'error');
    }
  };

  const currentImage = product.images[selectedImageIndex] || product.images[0];
  const imageUrl = currentImage?.storage_path;

  return (
    <div className="space-y-16 pb-20 md:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-start">
        {/* Left: Gallery (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            className={clsx(
              'w-full bg-[#FAF7F0] border border-[var(--line)] rounded-[2px] overflow-hidden relative',
              isBridal ? 'aspect-[3/4]' : 'aspect-square'
            )}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={currentImage?.alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 bg-amber-50">
                <span className="text-sm text-[var(--ink-muted)] uppercase tracking-wider text-center">
                  {product.name}
                </span>
              </div>
            )}
          </div>

          {/* New text label under image if created in last 30 days */}
          {isNew && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-bridal)]">
                New
              </span>
            </div>
          )}

          {/* Thumbnails if multiple images */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={clsx(
                    'w-20 h-20 relative rounded-[2px] overflow-hidden border transition-all cursor-pointer bg-stone-100',
                    selectedImageIndex === idx
                      ? 'border-[var(--ink)]'
                      : 'border-[var(--line)] opacity-75 hover:opacity-100'
                  )}
                >
                  {img.storage_path && (
                    <Image
                      src={img.storage_path}
                      alt={img.alt || `Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase Controls (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)] font-semibold">
                {product.category_slug === 'bridal'
                  ? 'Barakah Bridal Collections'
                  : product.category_slug === 'naturals'
                  ? 'Barakah Naturals'
                  : 'Barakah Kerala Pure Coconut Oil'}
              </span>
              {product.badge && <Badge variant="neutral">{product.badge}</Badge>}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] font-bold m-0 leading-tight">
              {product.name}
            </h1>

            {/* Rating Row ONLY if reviews exist */}
            {product.rating && product.rating.review_count > 0 && (
              <a
                href="#reviews"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-[var(--ink)] hover:underline"
              >
                <span className="font-bold">{product.rating.avg_rating.toFixed(1)}</span>
                <span className="text-[var(--accent-bridal)]">★</span>
                <span className="text-[var(--ink-muted)]">({product.rating.review_count})</span>
              </a>
            )}
          </div>

          {/* Price Block */}
          <div className="p-4 bg-[var(--surface-subtle)] border border-[var(--line)] rounded-[2px] space-y-1">
            <div className="flex items-baseline gap-3">
              <Price
                pricePaise={selectedVariant.price_paise}
                compareAtPricePaise={selectedVariant.compare_at_price_paise}
                size="lg"
              />
              {selectedVariant.net_quantity && selectedVariant.net_unit && (
                <UnitPrice
                  pricePaise={selectedVariant.price_paise}
                  netQuantity={selectedVariant.net_quantity}
                  netUnit={selectedVariant.net_unit}
                />
              )}
            </div>
            {SITE_CONFIG.confirmTaxInclusive && (
              <p className="text-[11px] text-[var(--ink-muted)] m-0">
                Inclusive of all taxes.
              </p>
            )}
          </div>

          {/* Bridal Option Pickers: Size & Colour */}
          {isBridal && (
            <div className="space-y-5">
              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                      {sizes.some((s) => s.includes('(')) ? 'Bangle Size' : 'Select Size'}
                    </span>
                    {sizes.some((s) => ['XS', 'S', 'M', 'L', 'XL'].includes(s)) && (
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs text-[var(--accent-bridal)] font-semibold underline hover:opacity-80 cursor-pointer"
                      >
                        Size Guide (Inches)
                      </button>
                    )}
                  </div>
                  <OptionPicker
                    label="Size"
                    options={sizes.map((s) => {
                      const v = product.variants.find(
                        (varItem) =>
                          varItem.option_values['Size'] === s &&
                          varItem.option_values['Colour'] === selectedVariant.option_values['Colour']
                      );
                      return {
                        value: s,
                        soldOut: v ? v.stock === 0 : false,
                      };
                    })}
                    selectedValue={selectedVariant.option_values['Size'] || sizes[0]}
                    onChange={handleSizeChange}
                  />
                </div>
              )}

              {colours.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block mb-2">
                    Select Colour
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {colours.map((c) => (
                      <Swatch
                        key={c}
                        name={c}
                        selected={selectedVariant.option_values['Colour'] === c}
                        onClick={() => handleColourChange(c)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Naturals / Oil: Pack Size Picker */}
          {!isBridal && packSizes.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block mb-2">
                Select Pack Size
              </span>
              <OptionPicker
                label="Pack Size"
                options={packSizes.map((ps) => {
                  const v = product.variants.find((varItem) => varItem.option_values['Pack size'] === ps);
                  return {
                    value: ps,
                    soldOut: v ? v.stock === 0 : false,
                  };
                })}
                selectedValue={selectedVariant.option_values['Pack size'] || packSizes[0]}
                onChange={handlePackSizeChange}
              />
            </div>
          )}

          {/* Stock Notice */}
          {isSoldOut ? (
            <div className="text-xs font-semibold">
              <span className="text-red-700 bg-red-50 px-2 py-1 rounded-[2px]">Sold Out</span>
            </div>
          ) : isLowStock ? (
            <div className="text-xs font-semibold">
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-[2px] border border-amber-200">
                Only {stock} left in stock
              </span>
            </div>
          ) : null}

          {/* Quantity & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <QuantityStepper
              value={quantity}
              min={1}
              max={Math.max(1, stock)}
              disabled={isSoldOut}
              onChange={setQuantity}
            />

            <Button
              variant="primary"
              size="lg"
              loading={addingToCart}
              disabled={isSoldOut}
              onClick={handleAddToCart}
              className="flex-1 bg-[var(--ink)] hover:bg-[var(--accent-bridal)] text-white rounded-[2px] font-medium text-xs uppercase tracking-wider cursor-pointer py-3 transition-colors"
            >
              <ShoppingBag size={18} className="mr-2" />
              {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleWishlist}
              aria-label="Save to Wishlist"
              className="px-4 border-[var(--line)] hover:border-[var(--ink)] rounded-[2px]"
            >
              <Heart size={20} strokeWidth={1.8} />
            </Button>
          </div>

          {/* WhatsApp Support Link if configured */}
          {SITE_CONFIG.whatsappNumber && (
            <div>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  `Hi Barakah Bazaar, I would like to inquire about ${product.name} (SKU: ${selectedVariant.sku}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#1B7A3E] border border-[#1B7A3E] rounded-[2px] hover:bg-[#1B7A3E]/5 transition-colors"
              >
                Inquire on WhatsApp
              </a>
            </div>
          )}

          {/* Attributes & Details */}
          <div className="space-y-4 text-xs text-[var(--ink)]">
            {product.description && (
              <div>
                <span className="font-bold uppercase tracking-wider text-stone-800 block mb-1">
                  Product Overview
                </span>
                <p className="m-0 leading-relaxed text-stone-600">{product.description}</p>
              </div>
            )}

            {isBridal && product.attributes && (
              <dl className="grid grid-cols-2 gap-4 p-4 bg-[var(--surface-subtle)] rounded-[2px] border border-[var(--line)]">
                {product.attributes.sub_category && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Type</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.sub_category}</dd>
                  </div>
                )}
                {product.attributes.inclusions && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Set Inclusions</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.inclusions}</dd>
                  </div>
                )}
                {product.attributes.fabric && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">
                      {product.attributes.sub_category ? 'Material & Plating' : 'Fabric'}
                    </dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.fabric}</dd>
                  </div>
                )}
                {product.attributes.work && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Work & Craft</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.work}</dd>
                  </div>
                )}
                {product.attributes.care && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Care</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.care}</dd>
                  </div>
                )}
                {product.attributes.occasion && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Occasion</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.occasion}</dd>
                  </div>
                )}
              </dl>
            )}

            {!isBridal && product.attributes && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--surface-subtle)] rounded-[2px] border border-[var(--line)]">
                {product.attributes.origin && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Origin</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.origin}</dd>
                  </div>
                )}
                {product.attributes.ingredients && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Ingredients</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.ingredients}</dd>
                  </div>
                )}
                {product.attributes.process && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Process</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.process}</dd>
                  </div>
                )}
                {product.attributes.shelf_life && (
                  <div>
                    <dt className="text-[var(--ink-muted)] uppercase tracking-wider font-semibold text-[10px]">Shelf Life</dt>
                    <dd className="m-0 font-medium mt-0.5">{product.attributes.shelf_life}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      </div>

      {/* Bridal Size Guide Dialog */}
      <Dialog
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        title="Indian Bridal Size Guide (Inches)"
        description="Standard garment measurements for Barakah Bridal ensembles."
      >
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse border border-[var(--line)]">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)]">
                <th className="p-2 border-r border-[var(--line)] font-bold">Size</th>
                <th className="p-2 border-r border-[var(--line)] font-bold">Bust</th>
                <th className="p-2 border-r border-[var(--line)] font-bold">Waist</th>
                <th className="p-2 border-r border-[var(--line)] font-bold">Hip</th>
                <th className="p-2 font-bold">Length</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--line)]">
                <td className="p-2 font-semibold border-r border-[var(--line)]">XS</td>
                <td className="p-2 border-r border-[var(--line)]">32</td>
                <td className="p-2 border-r border-[var(--line)]">26</td>
                <td className="p-2 border-r border-[var(--line)]">36</td>
                <td className="p-2">42</td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="p-2 font-semibold border-r border-[var(--line)]">S</td>
                <td className="p-2 border-r border-[var(--line)]">34</td>
                <td className="p-2 border-r border-[var(--line)]">28</td>
                <td className="p-2 border-r border-[var(--line)]">38</td>
                <td className="p-2">42</td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="p-2 font-semibold border-r border-[var(--line)]">M</td>
                <td className="p-2 border-r border-[var(--line)]">36</td>
                <td className="p-2 border-r border-[var(--line)]">30</td>
                <td className="p-2 border-r border-[var(--line)]">40</td>
                <td className="p-2">43</td>
              </tr>
              <tr className="border-b border-[var(--line)]">
                <td className="p-2 font-semibold border-r border-[var(--line)]">L</td>
                <td className="p-2 border-r border-[var(--line)]">38</td>
                <td className="p-2 border-r border-[var(--line)]">32</td>
                <td className="p-2 border-r border-[var(--line)]">42</td>
                <td className="p-2">43</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold border-r border-[var(--line)]">XL</td>
                <td className="p-2 border-r border-[var(--line)]">40</td>
                <td className="p-2 border-r border-[var(--line)]">34</td>
                <td className="p-2 border-r border-[var(--line)]">44</td>
                <td className="p-2">44</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-[var(--ink-muted)]">
            * Custom tailoring adjustments and blouse unstitched customizations available upon request.
          </p>
        </div>
      </Dialog>

      {/* Customer Reviews Section */}
      <section id="reviews" className="border-t border-[var(--line)] pt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl text-[var(--ink)] font-bold m-0">Customer Ratings & Reviews</h2>
            {product.rating && product.rating.review_count > 0 ? (
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-subtle)] text-[var(--ink)] border border-[var(--line)] text-xs font-semibold rounded-[2px]">
                  <span>{product.rating.avg_rating.toFixed(1)}</span>
                  <span className="text-[var(--accent-bridal)]">★</span>
                </span>
                <span className="text-xs text-[var(--ink-muted)]">
                  Based on verified customer reviews
                </span>
              </div>
            ) : (
              <p className="text-xs text-[var(--ink-muted)] mt-1 mb-0">No reviews yet.</p>
            )}
          </div>
        </div>

        {initialReviews.length === 0 ? (
          <div className="p-8 border border-[var(--line)] bg-[var(--surface)] text-center text-xs text-[var(--ink-muted)] rounded-[2px]">
            No customer reviews posted for this item yet. Verified customers with delivered orders can share their feedback.
          </div>
        ) : (
          <div className="space-y-4">
            {initialReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 border border-[var(--line)] bg-[var(--surface)] rounded-[2px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--ink)]">
                    {rev.reviewer_name || 'Verified Indian Buyer'}
                  </span>
                  <span className="text-[11px] text-[var(--ink-muted)] tabular-nums">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-[2px]">
                    {rev.rating} ★
                  </span>
                </div>
                <p className="text-xs text-[var(--ink)] m-0 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sticky add-to-cart bar on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--line)] p-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[var(--ink)] truncate m-0">{product.name}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-sm font-bold text-[var(--ink)]">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(selectedVariant.price_paise / 100)}
            </span>
            {discountPercent > 0 && (
              <span className="text-[11px] font-bold text-[#1B7A3E]">{discountPercent}% off</span>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={isSoldOut || addingToCart}
          onClick={handleAddToCart}
          className="px-5 py-2.5 bg-[var(--ink)] hover:bg-[var(--accent-bridal)] disabled:opacity-50 text-white text-xs font-semibold rounded-[2px] cursor-pointer uppercase tracking-wider transition-colors shrink-0"
        >
          {addingToCart ? 'Adding...' : isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
