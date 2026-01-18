'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Package, Pill, FlaskConical, Leaf, Search, ChevronRight, Dumbbell, Flame, Zap, Brain, Sparkles, Scissors, Heart } from 'lucide-react';
import type { Product, ProductGoal } from '@/types/database';

// Goal configuration with labels and icons
const GOAL_CONFIG: Record<ProductGoal, { label: string; icon: typeof Dumbbell }> = {
  muscle_building: { label: 'Muscle Building', icon: Dumbbell },
  fat_loss: { label: 'Fat Loss', icon: Flame },
  energy: { label: 'Energy', icon: Zap },
  cognitive: { label: 'Cognitive', icon: Brain },
  skin: { label: 'Skin', icon: Sparkles },
  hair: { label: 'Hair', icon: Scissors },
  libido: { label: 'Libido', icon: Heart },
};

const ALL_GOALS: ProductGoal[] = ['muscle_building', 'fat_loss', 'energy', 'cognitive', 'skin', 'hair', 'libido'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<ProductGoal[]>([]);

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      setProducts(data || []);
      setIsLoading(false);
    }

    fetchProducts();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle goal selection
  const toggleGoal = (goal: ProductGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  // Filter products based on search query and selected goals
  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply search filter first
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.short_description && p.short_description.toLowerCase().includes(query))
      );
    }

    // Apply goals filter (OR logic - show products matching ANY selected goal)
    if (selectedGoals.length > 0) {
      result = result.filter((p) =>
        p.goals && p.goals.some((goal) => selectedGoals.includes(goal))
      );
    }

    return result;
  }, [products, debouncedQuery, selectedGoals]);

  // Filter by type from filtered products
  const rxProducts = filteredProducts.filter((p) => p.type === 'rx');
  const peptideProducts = filteredProducts.filter((p) => p.type === 'peptide');
  const supplementProducts = filteredProducts.filter((p) => p.type === 'supplement');

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'rx':
        return <Pill className="h-5 w-5" />;
      case 'peptide':
        return <FlaskConical className="h-5 w-5" />;
      case 'supplement':
        return <Leaf className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/patient/products/${product.id}`} className="block">
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getProductIcon(product.type)}
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </div>
            <Badge variant="outline" className="capitalize">
              {product.type === 'rx' ? 'Prescription' : product.type}
            </Badge>
          </div>
          {product.short_description && (
            <CardDescription>{product.short_description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {product.long_description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{product.long_description}</p>
            )}
            {/* Goal badges */}
            {product.goals && product.goals.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.goals.map((goal) => {
                  const config = GOAL_CONFIG[goal];
                  const Icon = config.icon;
                  return (
                    <Badge key={goal} variant="secondary" className="text-xs gap-1">
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  );
                })}
              </div>
            )}
            {/* Peptide dosing disclaimer */}
            {product.type === 'peptide' && product.dosing_info && (
              <p className="text-xs italic text-muted-foreground">
                For educational purposes only
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <p className="text-lg font-bold">${product.cost.toFixed(2)}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderProductGrid = (productList: Product[], emptyIcon: typeof Package, emptyTitle: string, emptyDescription: string) => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      );
    }

    if (productList.length > 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }

    // Check if no results due to search/filters or no products at all
    if ((debouncedQuery.trim() || selectedGoals.length > 0) && products.length > 0) {
      return (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Search}
              title="No products match your filters"
              description="Try adjusting your search or goal filters."
            />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        description="Browse available medications, peptides, and supplements"
      />

      <Tabs defaultValue="all" className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Goal filter chips */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Filter by goal:</p>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {ALL_GOALS.map((goal) => {
                const config = GOAL_CONFIG[goal];
                const Icon = config.icon;
                const isSelected = selectedGoals.includes(goal);
                return (
                  <Badge
                    key={goal}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer gap-1.5 px-3 py-1.5 transition-colors hover:bg-primary/10"
                    onClick={() => toggleGoal(goal)}
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <TabsList>
          <TabsTrigger value="all">
            All Products ({filteredProducts.length})
          </TabsTrigger>
          <TabsTrigger value="rx" className="gap-2">
            <Pill className="h-4 w-4" />
            Prescriptions ({rxProducts.length})
          </TabsTrigger>
          <TabsTrigger value="peptides" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Peptides ({peptideProducts.length})
          </TabsTrigger>
          <TabsTrigger value="supplements" className="gap-2">
            <Leaf className="h-4 w-4" />
            Supplements ({supplementProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderProductGrid(filteredProducts, Package, 'No Products Available', 'Products will be added to the catalog soon.')}
        </TabsContent>

        <TabsContent value="rx">
          {renderProductGrid(rxProducts, Pill, 'No Prescriptions Available', 'Prescription medications will be added soon.')}
        </TabsContent>

        <TabsContent value="peptides">
          {renderProductGrid(peptideProducts, FlaskConical, 'No Peptides Available', 'Peptide therapies will be added soon.')}
        </TabsContent>

        <TabsContent value="supplements">
          {renderProductGrid(supplementProducts, Leaf, 'No Supplements Available', 'Supplement products will be added soon.')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
