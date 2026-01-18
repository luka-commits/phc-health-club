import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/shared/page-header';
import { ArrowLeft, Package, Pill, FlaskConical, Leaf, AlertCircle, Info, Dumbbell, Flame, Zap, Brain, Sparkles, Scissors, Heart } from 'lucide-react';
import type { ProductGoal } from '@/types/database';

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

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Fetch product by ID
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single();

  if (productError || !product) {
    notFound();
  }

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'rx':
        return <Pill className="h-6 w-6" />;
      case 'peptide':
        return <FlaskConical className="h-6 w-6" />;
      case 'supplement':
        return <Leaf className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'rx':
        return 'destructive' as const;
      case 'peptide':
        return 'secondary' as const;
      case 'supplement':
        return 'default' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/patient/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <Package className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {getProductIcon(product.type)}
            <PageHeader
              title={product.name}
              description={product.short_description || undefined}
              className="flex-1"
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={getTypeBadgeVariant(product.type)} className="capitalize">
              {product.type === 'rx' ? 'Prescription' : product.type}
            </Badge>
            <span className="text-2xl font-bold">${product.cost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {product.long_description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{product.long_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Health Goals section - only show if product has goals */}
      {product.goals && product.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Health Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.goals.map((goal: ProductGoal) => {
                const config = GOAL_CONFIG[goal];
                const Icon = config.icon;
                return (
                  <Badge key={goal} variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {product.dosing_info && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Dosing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{product.dosing_info}</p>
          </CardContent>
        </Card>
      )}

      {/* Peptide dosing disclaimer */}
      {product.type === 'peptide' && product.dosing_info && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Dosing information is provided for educational purposes only. Always consult with your healthcare provider before starting any peptide therapy.
          </AlertDescription>
        </Alert>
      )}

      {product.compounding_pharmacies && product.compounding_pharmacies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available at Pharmacies</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1">
              {product.compounding_pharmacies.map((pharmacy: string, index: number) => (
                <li key={index} className="text-muted-foreground">
                  {pharmacy}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {product.type === 'rx' && (
        <Card className="border-amber-500/20 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <Pill className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This product requires a valid prescription from your healthcare provider.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
