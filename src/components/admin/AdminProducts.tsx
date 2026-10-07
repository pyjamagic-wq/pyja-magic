import React, { useMemo, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Database,
  AlertCircle,
  CheckCircle2,
  Copy,
  ShieldAlert,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { Product, ProductVariant } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { testSupabaseConnection } from '../../services/supabase/supabaseClient';
import { SUPABASE_RLS_FIX_SQL } from '../../data/sqlSchemaString';
import { generateUUID } from '../../services/storage/store';
import { uploadProductImage } from '../../utils/uploadImage';

const DEFAULT_SIZES = [
  { sizeId: 's', sizeName: 'S' },
  { sizeId: 'm', sizeName: 'M' },
  { sizeId: 'l', sizeName: 'L' },
];

function slugifyColor(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `color-${Date.now()}`;
}

export const AdminProducts: React.FC = () => {
  const { products, saveProduct, deleteProduct, clearAllProducts, loadProductsFromSupabase } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; rlsBlocked?: boolean } | null>(null);
  const [showRlsModal, setShowRlsModal] = useState(false);
  const [rlsCopied, setRlsCopied] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Pyjamas satin');
  const [price, setPrice] = useState(4900);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [colorUrlInputs, setColorUrlInputs] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#BE395D');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isNew, setIsNew] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const uniqueColors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; hex: string }>();
    variants.forEach((v) => {
      map.set(v.colorId, { id: v.colorId, name: v.colorName, hex: v.colorHex });
    });
    return Array.from(map.values());
  }, [variants]);

  const categories = [
    'Pyjamas satin',
    'Pyjamas coton',
    'Ensembles',
    'Collection hiver',
    'Collection été',
  ];

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategory('Pyjamas satin');
    setPrice(4900);
    setCompareAtPrice(5900);
    setDescription('Ensemble pyjama haut de gamme confectionné dans un tissu soyeux de grande qualité.');
    setMaterial('95% Satin Soie Luxe, 5% Élasthanne');
    setCareInstructions('Lavage délicat à 30°C.');
    setLocation('Étagère Satin A1');
    setImages([]);
    setColorImages({});
    setColorUrlInputs({});
    setNewColorName('');
    setNewColorHex('#BE395D');
    setIsFeatured(true);
    setIsNew(true);
    setIsBestSeller(false);

    // Initial default variant matrix
    setVariants([
      {
        id: generateUUID(),
        productId: '',
        sizeId: 's',
        sizeName: 'S',
        colorId: 'rose',
        colorName: 'Rose Poudré',
        colorHex: '#F6C1CB',
        sku: 'PJM-NEW-ROS-S',
        stockQuantity: 10,
        lowStockThreshold: 3,
        location: 'Étagère A1 - Boîte S',
        isActive: true,
      },
      {
        id: generateUUID(),
        productId: '',
        sizeId: 'm',
        sizeName: 'M',
        colorId: 'rose',
        colorName: 'Rose Poudré',
        colorHex: '#F6C1CB',
        sku: 'PJM-NEW-ROS-M',
        stockQuantity: 15,
        lowStockThreshold: 3,
        location: 'Étagère A1 - Boîte M',
        isActive: true,
      },
      {
        id: generateUUID(),
        productId: '',
        sizeId: 'l',
        sizeName: 'L',
        colorId: 'rose',
        colorName: 'Rose Poudré',
        colorHex: '#F6C1CB',
        sku: 'PJM-NEW-ROS-L',
        stockQuantity: 8,
        lowStockThreshold: 3,
        location: 'Étagère A1 - Boîte L',
        isActive: true,
      },
    ]);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreating(false);
    setName(prod.name);
    setSlug(prod.slug);
    setCategory(prod.category);
    setPrice(prod.price);
    setCompareAtPrice(prod.compareAtPrice);
    setDescription(prod.description);
    setMaterial(prod.material);
    setCareInstructions(prod.careInstructions);
    setLocation(prod.location || 'Atelier Principal');
    setImages([...prod.images]);
    setColorImages(prod.colorImages ? { ...prod.colorImages } : {});
    setColorUrlInputs({});
    setNewColorName('');
    setNewColorHex('#BE395D');
    setIsFeatured(prod.isFeatured);
    setIsNew(prod.isNew);
    setIsBestSeller(prod.isBestSeller);
    setVariants(JSON.parse(JSON.stringify(prod.variants)));
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUploadGeneralImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadProductImage(file);
        uploaded.push(res.url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : 'Erreur upload image');
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadColorImages = async (colorId: string, files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadProductImage(file);
        uploaded.push(res.url);
      }
      setColorImages((prev) => ({
        ...prev,
        [colorId]: [...(prev[colorId] || []), ...uploaded],
      }));
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : 'Erreur upload image');
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  const handleAddColorUrl = (colorId: string) => {
    const url = (colorUrlInputs[colorId] || '').trim();
    if (!url) return;
    setColorImages((prev) => ({
      ...prev,
      [colorId]: [...(prev[colorId] || []), url],
    }));
    setColorUrlInputs((prev) => ({ ...prev, [colorId]: '' }));
  };

  const handleRemoveColorImage = (colorId: string, index: number) => {
    setColorImages((prev) => ({
      ...prev,
      [colorId]: (prev[colorId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddColor = () => {
    const name = newColorName.trim();
    if (!name) return;
    let colorId = slugifyColor(name);
    if (variants.some((v) => v.colorId === colorId)) {
      colorId = `${colorId}-${Date.now().toString().slice(-4)}`;
    }
    const hex = newColorHex || '#BE395D';
    const newVariants: ProductVariant[] = DEFAULT_SIZES.map((s) => ({
      id: generateUUID(),
      productId: '',
      sizeId: s.sizeId,
      sizeName: s.sizeName,
      colorId,
      colorName: name,
      colorHex: hex,
      sku: `PJM-${colorId.toUpperCase().slice(0, 6)}-${s.sizeName}`,
      stockQuantity: 10,
      lowStockThreshold: 3,
      location: location || 'Atelier Principal',
      isActive: true,
    }));
    setVariants((prev) => [...prev, ...newVariants]);
    setColorImages((prev) => ({ ...prev, [colorId]: prev[colorId] || [] }));
    setNewColorName('');
  };

  const handleRemoveColor = (colorId: string) => {
    setVariants((prev) => prev.filter((v) => v.colorId !== colorId));
    setColorImages((prev) => {
      const next = { ...prev };
      delete next[colorId];
      return next;
    });
  };

  const handleUpdateVariantStock = (vId: string, newStock: number) => {
    setVariants(
      variants.map((v) =>
        v.id === vId ? { ...v, stockQuantity: Math.max(0, newStock) } : v
      )
    );
  };

  const handleUpdateVariantLocation = (vId: string, newLocation: string) => {
    setVariants(
      variants.map((v) =>
        v.id === vId ? { ...v, location: newLocation } : v
      )
    );
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearStock = () => {
    clearAllProducts();
    setShowClearConfirm(false);
    setActionNotice('✓ Stock démo vidé avec succès ! Votre boutique est prête pour vos propres produits.');
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleSyncFromSupabase = async () => {
    setActionNotice('Synchronisation depuis Supabase en cours...');
    const res = await loadProductsFromSupabase();
    if (res.success) {
      setActionNotice(
        res.count > 0
          ? `✓ ${res.count} produit(s) récupéré(s) depuis votre base Supabase !`
          : '✓ Connecté à Supabase. Aucun produit encore enregistré. Ajoutez votre premier pyjama ci-dessous.'
      );
    } else {
      setActionNotice(`Erreur de synchronisation : ${res.message}`);
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleTestDb = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    const res = await testSupabaseConnection();
    setDbTestResult(res);
    setIsTestingDb(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSavingProduct(true);
    const prodId = editingProduct ? editingProduct.id : generateUUID();
    const cleanSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updatedProduct: Product = {
      id: prodId,
      name: name.trim(),
      slug: cleanSlug,
      category,
      shortDescription: description.slice(0, 120),
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      material,
      careInstructions,
      location: location.trim() || 'Atelier Principal',
      images:
        images.length > 0
          ? images
          : Object.values(colorImages).flat().length > 0
            ? Object.values(colorImages).flat().slice(0, 1)
            : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'],
      colorImages: Object.fromEntries(
        Object.entries(colorImages).filter(([, imgs]) => imgs.length > 0)
      ),
      isActive: editingProduct ? editingProduct.isActive : true,
      isFeatured,
      isNew,
      isBestSeller,
      variants: variants.map((v) => ({
        ...v,
        productId: prodId,
        image: colorImages[v.colorId]?.[0] || v.image,
      })),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: editingProduct?.rating || 5.0,
      reviewCount: editingProduct?.reviewCount || 0,
    };

    const syncRes = await saveProduct(updatedProduct);
    setIsSavingProduct(false);
    setEditingProduct(null);
    setIsCreating(false);

    if (syncRes?.success) {
      setActionNotice(`✓ Produit "${updatedProduct.name}" enregistré et sauvegardé avec succès dans Supabase !`);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      const errMsg = syncRes?.message || 'Erreur inconnue';
      const isRls = errMsg.includes('row-level security') || errMsg.includes('42501');
      if (isRls) {
        setActionNotice(`⚠️ Produit enregistré localement, mais Supabase bloque l'accès (Sécurité RLS). Débloquez votre base ci-dessous.`);
        setShowRlsModal(true);
      } else {
        setActionNotice(`⚠️ Produit sauvegardé localement, mais erreur Supabase : ${errMsg}`);
        setTimeout(() => setActionNotice(null), 6000);
      }
    }
  };

  const handleCopyRlsScript = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
      setRlsCopied(true);
      setTimeout(() => setRlsCopied(false), 4000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Modal / Popup Déblocage RLS Supabase */}
      {showRlsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#F2E5E8] space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-amber-700">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2D2024]">
                    Déblocage Supabase requis (Erreur RLS)
                  </h3>
                  <p className="text-[11px] text-[#8C737B]">
                    Votre table "products" refuse les ajouts de la clé publique anon.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRlsModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF5F6] flex items-center justify-center text-[#70585F] hover:bg-[#F2E5E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <p className="font-semibold">Pourquoi mon produit n'apparaît pas sur Supabase ?</p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Supabase active par défaut la sécurité <strong>Row Level Security (RLS)</strong> qui interdit toute écriture depuis le site web. Pour autoriser l'ajout de vos pyjamas, il suffit d'exécuter ce script rapide de 2 lignes dans votre SQL Editor Supabase.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#2D2024]">Procédure express (30 secondes) :</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[#523F44] text-[11px] leading-relaxed">
                <li>
                  Rendez-vous dans votre projet Supabase &gt; onglet <strong>SQL Editor</strong> à gauche.
                </li>
                <li>
                  Cliquez sur <strong>New query</strong> (Nouvelle requête).
                </li>
                <li>
                  Collez le code ci-dessous et cliquez sur le bouton vert <strong>RUN</strong>.
                </li>
              </ol>
            </div>

            <div className="relative">
              <pre className="bg-[#1F171A] text-[#F9E2E7] p-3 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-36">
                {SUPABASE_RLS_FIX_SQL}
              </pre>
              <button
                type="button"
                onClick={handleCopyRlsScript}
                className="mt-2.5 w-full bg-[#BE395D] hover:bg-[#A32D4C] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{rlsCopied ? '✓ Script SQL copié dans le presse-papier !' : 'Copier le script SQL de déblocage'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRlsModal(false);
                  handleTestDb();
                }}
                className="text-xs font-semibold text-[#70585F] hover:text-[#2D2024] underline"
              >
                J'ai exécuté le script, retester la connexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 bg-[#2D2024] text-white rounded-2xl text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-[#F5B5C4] underline ml-3">
            Fermer
          </button>
        </div>
      )}

      {/* Supabase Test Result Banner */}
      {dbTestResult && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            dbTestResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {dbTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{dbTestResult.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {dbTestResult.rlsBlocked && (
              <button
                onClick={() => setShowRlsModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Débloquer Supabase</span>
              </button>
            )}
            <button onClick={() => setDbTestResult(null)} className="underline text-xs ml-1">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#F2E5E8] shadow-2xs">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
            Catalogue & Fiches Produits
          </h2>
          <p className="text-xs text-[#8C737B] mt-0.5">
            {products.length} modèle(s) configuré(s) dans la boutique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Test Supabase Connection */}
          <button
            onClick={handleTestDb}
            disabled={isTestingDb}
            className="px-3.5 py-2.5 rounded-xl border border-[#EBDDE1] bg-[#FAF8F8] hover:bg-[#F2E0E5] text-[#523F44] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Tester la connexion à votre base Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isTestingDb ? 'Vérification...' : 'Tester Supabase'}</span>
          </button>

          {/* Sync Supabase */}
          <button
            onClick={handleSyncFromSupabase}
            className="px-3.5 py-2.5 rounded-xl border border-[#EBDDE1] bg-[#FAF8F8] hover:bg-[#F2E0E5] text-[#523F44] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Charger les produits depuis Supabase"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#BE395D]" />
            <span>Sync Supabase</span>
          </button>

          {/* Clear Demo Stock Button */}
          {products.length > 0 && !showClearConfirm && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Vider tous les produits démo pour repartir de zéro"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vider le stock ({products.length})</span>
            </button>
          )}

          {products.length > 0 && showClearConfirm && (
            <div className="flex items-center gap-1.5 p-1 bg-red-50 border border-red-300 rounded-xl">
              <span className="text-[11px] text-red-800 font-bold px-2">Confirmer le vidage ?</span>
              <button
                onClick={handleClearStock}
                className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                Oui, vider
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="bg-white hover:bg-gray-100 text-[#523F44] text-[11px] font-medium px-2 py-1.5 rounded-lg border border-gray-200"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Add Product Button */}
          <button
            onClick={handleOpenCreate}
            className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Pyjama</span>
          </button>
        </div>
      </div>

      {/* Empty State when no products */}
      {products.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-[#F2E5E8] text-center space-y-4 max-w-xl mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF3F5] text-[#BE395D] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
            Votre stock démo est vide !
          </h3>
          <p className="text-xs text-[#70585F] leading-relaxed">
            Vous pouvez maintenant ajouter vos propres créations. Vos articles s’enregistreront directement dans votre base Supabase avec vos photos, prix, tailles, couleurs et emplacements dans votre atelier.
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenCreate}
              className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter mon premier Pyjama</span>
            </button>
          </div>
        </div>
      )}

      {/* Product List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const totalStock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-[#F2E5E8] overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="aspect-[16/10] bg-[#FAF3F5] overflow-hidden relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="text-[10px] bg-white/90 text-[#2D2024] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                      {product.category}
                    </span>
                    {totalStock === 0 && (
                      <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                        Épuisé
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif-luxury text-lg font-bold text-[#2D2024] line-clamp-1">
                      {product.name}
                    </h3>
                    <span className="text-xs font-bold text-[#BE395D]">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#70585F] line-clamp-2">
                    {product.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#8C737B] border-t border-[#FAF3F5]">
                    <span>
                      {product.variants.length} variante(s)
                    </span>
                    <span className="font-semibold text-[#2D2024]">
                      Stock total : {totalStock} pièces
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="flex-1 bg-[#FAF3F5] hover:bg-[#F2E0E5] text-[#BE395D] py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Supprimer définitivement "${product.name}" ?`)) {
                      deleteProduct(product.id);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#FAF7F6] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#F2E5E8] flex flex-col">
            <div className="p-5 sm:p-6 bg-white border-b border-[#F2E5E8] flex items-center justify-between sticky top-0 z-20">
              <h3 className="font-serif-luxury text-xl font-bold text-[#2D2024]">
                {isCreating ? 'Nouveau Modèle de Pyjama' : `Modifier: ${name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-[#70585F] hover:bg-[#FAF3F5] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 sm:p-8 space-y-6 flex-1">
              {/* General info */}
              <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2024]">
                  1. Informations Générales
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D2024] mb-1">Nom du modèle *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Pyjama Rose Poudré Satin"
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2024] mb-1">Catégorie *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D2024] mb-1">Prix de vente (DA) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2024] mb-1">Ancien prix (si promo) (DA)</label>
                    <input
                      type="number"
                      value={compareAtPrice || ''}
                      onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Ex: 5900"
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2024] mb-1">Description détaillée</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D2024] mb-1">Matière</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2024] mb-1">Conseils d'entretien</label>
                    <input
                      type="text"
                      value={careInstructions}
                      onChange={(e) => setCareInstructions(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2024] mb-1">
                      📍 Emplacement en stock (Atelier / Étagère)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Étagère A1, Bac Rose 2..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D] bg-[#FAF8F8]"
                    />
                  </div>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2024]">
                  2. Images générales du produit
                </h4>
                <p className="text-[11px] text-[#70585F]">
                  Photos par défaut (catalogue). Vous pouvez uploader vos fichiers ou coller un lien.
                </p>

                <div className="flex flex-wrap gap-2">
                  <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    uploading ? 'bg-stone-200 text-stone-500' : 'bg-[#2D2024] text-white hover:bg-[#402E34]'
                  }`}>
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Upload…' : 'Choisir des photos'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      className="hidden"
                      onChange={(e) => {
                        handleUploadGeneralImages(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Ou coller une URL (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 text-xs p-3 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="bg-[#2D2024] text-white text-xs px-4 rounded-xl font-semibold hover:bg-[#402E34]"
                  >
                    Ajouter
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-28 rounded-xl overflow-hidden border border-[#EBDDE1]">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos par couleur */}
              <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2024]">
                  3. Photos par couleur
                </h4>
                <p className="text-[11px] text-[#70585F]">
                  Quand la cliente choisit une couleur, ces photos s’affichent (ex. rouge → pyjama rouge).
                </p>

                <div className="flex flex-wrap gap-2 items-end p-3 rounded-xl bg-[#FAF3F5] border border-[#F2E5E8]">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-semibold text-[#70585F] mb-1">Nouvelle couleur</label>
                    <input
                      type="text"
                      placeholder="Ex: Rouge, Noir…"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#70585F] mb-1">Teinte</label>
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-[#EBDDE1] cursor-pointer bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="inline-flex items-center gap-1.5 bg-[#BE395D] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#9E2B4B]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter couleur
                  </button>
                </div>

                <div className="space-y-4">
                  {uniqueColors.map((color) => (
                    <div key={color.id} className="rounded-xl border border-[#F2E5E8] p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-black/15"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs font-bold text-[#2D2024]">{color.name}</span>
                        </div>
                        {uniqueColors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(color.id)}
                            className="text-[10px] font-semibold text-red-600 hover:underline"
                          >
                            Retirer couleur
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold cursor-pointer ${
                          uploading ? 'bg-stone-100 text-stone-400' : 'bg-[#FAF3F5] text-[#BE395D] hover:bg-[#F6E4E9]'
                        }`}>
                          <Upload className="w-3 h-3" />
                          Upload photo {color.name}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={uploading}
                            className="hidden"
                            onChange={(e) => {
                              handleUploadColorImages(color.id, e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <div className="flex flex-1 gap-1.5 min-w-[200px]">
                          <input
                            type="url"
                            placeholder="Ou URL…"
                            value={colorUrlInputs[color.id] || ''}
                            onChange={(e) =>
                              setColorUrlInputs((prev) => ({ ...prev, [color.id]: e.target.value }))
                            }
                            className="flex-1 text-[11px] p-2 rounded-lg border border-[#EBDDE1] focus:outline-none focus:border-[#BE395D]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddColorUrl(color.id)}
                            className="px-3 rounded-lg bg-[#2D2024] text-white text-[11px] font-semibold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(colorImages[color.id] || []).map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-20 h-24 rounded-lg overflow-hidden border border-[#EBDDE1]"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveColorImage(color.id, idx)}
                              className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                        {(colorImages[color.id] || []).length === 0 && (
                          <span className="text-[10px] text-[#A69398]">Aucune photo pour cette couleur</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants and Stock Matrix */}
              <div className="bg-white p-5 rounded-2xl border border-[#F2E5E8] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2024]">
                  4. Gestion des Variantes (Tailles / Couleurs / Stocks / Emplacements)
                </h4>

                <div className="overflow-x-auto rounded-xl border border-[#F2E5E8]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF3F5] text-[#2D2024] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Couleur</th>
                        <th className="py-2.5 px-3">Taille</th>
                        <th className="py-2.5 px-3">Stock Actuel</th>
                        <th className="py-2.5 px-3">📍 Emplacement Spécifique</th>
                        <th className="py-2.5 px-3">Seuil Alerte</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2E5E8]">
                      {variants.map((v) => (
                        <tr key={v.id}>
                          <td className="py-2 px-3 font-medium">
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full border border-black/15" style={{ backgroundColor: v.colorHex }} />
                              {v.colorName}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-[#BE395D]">{v.sizeName}</td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={v.stockQuantity}
                              onChange={(e) => handleUpdateVariantStock(v.id, Number(e.target.value))}
                              className="w-20 p-1.5 rounded-lg border border-[#EBDDE1] text-xs font-bold text-[#2D2024]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Ex: Étagère A1 - Boîte S"
                              value={v.location || ''}
                              onChange={(e) => handleUpdateVariantLocation(v.id, e.target.value)}
                              className="w-48 p-1.5 rounded-lg border border-[#EBDDE1] text-xs text-[#2D2024]"
                            />
                          </td>
                          <td className="py-2 px-3 text-[#70585F]">{v.lowStockThreshold} pcs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-3 rounded-xl border border-[#EBDDE1] text-xs font-bold text-[#70585F] hover:bg-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-3 rounded-xl bg-[#BE395D] hover:bg-[#9E2B4B] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2"
                >
                  {isSavingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingProduct ? 'Enregistrement & Sync Supabase...' : 'Enregistrer le produit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
