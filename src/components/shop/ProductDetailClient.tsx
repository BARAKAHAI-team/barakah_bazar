'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, MapPin, Check, Star } from 'lucide-react';
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

  // Indian Pincode Delivery Estimator
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

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
        toast(`Added ${quantity} item(s) to your bag.`, 'success');
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

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus('Please enter a valid 6-digit Indian pincode.');
      return;
    }
    setPincodeStatus(`Available! Standard Delivery to ${pincode.trim()} in 2-4 business days.`);
  };

  const currentImage = product.images[selectedImageIndex] || product.images[0];
  const imageUrl = currentImage?.storage_path;

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-start">
        {/* Left: Gallery (5 cols) */}
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

            {/* Discount tag on PDP */}
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 z-10">
                <span className="px-2 py-0.5 bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] text-xs font-medium uppercase tracking-wider rounded-[2px]">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
          </div>

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
              <span className="text-xs uppercase tracking-[0.14em] text-amber-800 font-bold">
                {product.category_slug === 'bridal'
                  ? 'Barakah Bridal Couture & Ornaments'
                  : product.category_slug === 'naturals'
                  ? 'Barakah Farm Naturals'
                  : 'Barakah Kerala Pure Coconut Oil'}
              </span>
              {product.badge && <Badge variant="neutral">{product.badge}</Badge>}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] font-bold m-0 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars Chip */}
            {product.rating && product.rating.review_count > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded">
                  <span>{product.rating.avg_rating.toFixed(1)}</span>
                  <Star size={12} className="fill-emerald-700 text-emerald-700" />
                </span>
                <span className="text-xs text-[var(--ink-muted)]">
                  {product.rating.review_count} Ratings & Verified Reviews
                </span>
              </div>
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
            <p className="text-[11px] text-[var(--ink-muted)] m-0">
              Inclusive of all taxes.
            </p>
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
                        className="text-xs text-[#6B1D2F] font-semibold underline hover:opacity-80 cursor-pointer"
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
                    Select Shade
                  </span>
                  <div className="flex flex-wrap gap-4">
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
          <div className="text-xs font-semibold">
            {isSoldOut ? (
              <span className="text-red-700 bg-red-50 px-2 py-1 rounded">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                Hurry, only {stock} left in stock
              </span>
            ) : (
              <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1 w-fit">
                <Check size={14} /> In Stock & Ready to Ship
              </span>
            )}
          </div>

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
              className="flex-1 bg-[var(--ink)] hover:bg-black text-[var(--bg)] rounded-[2px] font-medium text-xs uppercase tracking-wider cursor-pointer py-3"
            >
              <ShoppingBag size={18} className="mr-2" />
              {isSoldOut ? 'Sold Out' : 'Add to Bag'}
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

          {/* Indian Pincode Delivery Estimator */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[2px] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
              <MapPin size={16} strokeWidth={1.5} /> Check Delivery to Pincode
            </div>
            <form onSubmit={checkPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3 py-2 text-xs border border-[var(--line)] rounded-[2px] outline-hidden focus:border-[var(--ink)]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--ink)] text-[var(--bg)] text-xs font-medium rounded-[2px] uppercase tracking-wider cursor-pointer hover:bg-black transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p
                className={clsx(
                  'text-xs mt-1 mb-0 font-medium',
                  pincodeStatus.startsWith('Available') ? 'text-emerald-700' : 'text-red-600'
                )}
              >
                {pincodeStatus}
              </p>
            )}
          </div>

          {/* Service notes */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-[var(--line)] text-center text-xs text-[var(--ink-muted)]">
            <div className="flex flex-col items-center gap-1">
              <Truck size={16} strokeWidth={1.5} />
              <span>Pan-India Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw size={16} strokeWidth={1.5} />
              <span>7-Day Return Policy</span>
            </div>
          </div>

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
      <section className="border-t border-[var(--line)] pt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl text-[var(--ink)] font-bold m-0">Customer Ratings & Reviews</h2>
            {product.rating && product.rating.review_count > 0 ? (
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-subtle)] text-[var(--ink)] border border-[var(--line)] text-xs font-semibold rounded-[2px]">
                  <span>{product.rating.avg_rating.toFixed(1)}</span>
                  <Star size={12} className="fill-[var(--ink)] text-[var(--ink)]" />
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
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                    {rev.rating} ★
                  </span>
                </div>
                <p className="text-xs text-[var(--ink)] m-0 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
