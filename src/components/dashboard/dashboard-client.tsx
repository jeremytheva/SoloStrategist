'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bot, BrainCircuit, Coins, DollarSign, Zap } from 'lucide-react';
import { MetricCard } from './metric-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile, DashboardMetrics } from '@/lib/types';
import {
  getCoachAdviceAction,
  runFinancialAuditAction,
  getTechStackAction,
  deployWorkflowAction,
} from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2 } from 'lucide-react';

export function DashboardClient() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [aiResult, setAiResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [isAiRunning, setIsAiRunning] = useState<string | null>(null);
  
  const { toast } = useToast();

  const metricsDocRef = useMemoFirebase(() => {
    if (!user) return null;
    // Reading from the top-level 'metrics' collection, keyed by user UID
    return doc(firestore, 'metrics', user.uid);
  }, [firestore, user]);
  const { data: metrics, isLoading: metricsLoading } = useDoc<DashboardMetrics>(metricsDocRef);

  const profileDocRef = useMemoFirebase(() => {
    if (!user) return null;
    // Reading from the top-level 'users' collection
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(profileDocRef);


  const loading = metricsLoading || profileLoading;

  const handleAiAction = async (action: 'coach' | 'audit' | 'tech' | 'workflow') => {
    if (action === 'coach') {
      if (!profile?.businessName || !metrics) {
        toast({
          title: 'Missing data',
          description: 'Add your business profile and metrics before requesting AI coaching.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (action === 'tech' && !profile?.businessName) {
      toast({
        title: 'Business details needed',
        description: 'Provide your business name to receive tech stack recommendations.',
        variant: 'destructive',
      });
      return;
    }

    setIsAiRunning(action);
    setAiResult(null);

    try {
      if (action === 'workflow') {
        const workflowResult = await deployWorkflowAction();
        toast({
          title: workflowResult.success ? 'Success' : 'Error',
          description: workflowResult.message,
          variant: workflowResult.success ? 'default' : 'destructive',
        });
        return;
      }

      let result;
      if (action === 'coach') {
        setModalTitle('Your AI Business Coach');
        setModalDescription('Personalized advice to grow your business.');
        result = await getCoachAdviceAction(profile!.businessName!, metrics!, 'Launched a new ad campaign.');
      } else if (action === 'audit') {
        setModalTitle('Financial Audit Results');
        setModalDescription('Discover savings and forecast future growth.');
        result = await runFinancialAuditAction();
      } else {
        setModalTitle('Tech Stack Recommendation');
        setModalDescription('The best tools to power your business.');
        result = await getTechStackAction(profile!.businessName!);
      }

      if (result && result.success) {
        setAiResult(result.data);
        setIsModalOpen(true);
      } else {
        toast({
          title: 'Analysis Failed',
          description: result?.error || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsAiRunning(null);
    }
  };

    const renderAiResult = () => {
        if (!aiResult) return null;
        if (modalTitle.includes('Coach')) {
            return (
                <div className="space-y-4">
                    <p className="font-semibold text-primary">Advice:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.advice}</p>
                    <p className="font-semibold text-primary">Recommended Actions:</p>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.recommendedActions}</div>
                </div>
            );
        }
        if (modalTitle.includes('Audit')) {
            return (
                <div className="space-y-4">
                    <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertTitle>Projected Savings</AlertTitle>
                        <AlertDescription className="text-2xl font-bold text-green-600">${aiResult.projectedSavings.toLocaleString()}</AlertDescription>
                    </Alert>
                     <p className="font-semibold text-primary">Unused Subscriptions:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {aiResult.unusedSubscriptions.map((sub: string) => <li key={sub}>{sub}</li>)}
                    </ul>
                    <p className="font-semibold text-primary">Funnel Projections:</p>
                    <p className="text-sm text-muted-foreground">{aiResult.funnelProjections}</p>
                </div>
            );
        }
        if (modalTitle.includes('Tech Stack')) {
            return (
                <div className="space-y-4">
                    <p className="font-semibold text-primary">Recommendations:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {aiResult.recommendations.map((tech: string) => <li key={tech}>{tech}</li>)}
                    </ul>
                    <p className="font-semibold text-primary">Reasoning:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.reasoning}</p>
                </div>
            );
        }
        return null;
    };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.displayName || 'Strategist'}. Here's your business overview.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading || !metrics ? (
            <>
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
            </>
        ) : (
            <>
                <MetricCard icon={BarChart} title="Lead Count" value={(metrics.leadCount || 0).toLocaleString()} />
                <MetricCard icon={Zap} title="Engagement Rate" value={`${metrics.engagementRate || 0}%`} />
                <MetricCard icon={Coins} title="Conversion Rate" value={`${metrics.conversionRate || 0}%`} />
            </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI-Powered Strategy Suite</CardTitle>
          <CardDescription>Leverage AI to make smarter business decisions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => handleAiAction('coach')} disabled={!!isAiRunning || loading}>
            {isAiRunning === 'coach' ? <Loader2 className="animate-spin" /> : <Bot />}
            AI Business Coach
          </Button>
          <Button onClick={() => handleAiAction('audit')} disabled={!!isAiRunning}>
             {isAiRunning === 'audit' ? <Loader2 className="animate-spin" /> : <DollarSign />}
            Run Financial Audit
          </Button>
           <Button onClick={() => handleAiAction('tech')} disabled={!!isAiRunning || loading}>
             {isAiRunning === 'tech' ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
            Analyze Tech Stack
          </Button>
           <Button onClick={() => handleAiAction('workflow')} disabled={!!isAiRunning}>
             {isAiRunning === 'workflow' ? <Loader2 className="animate-spin" /> : <Zap />}
            Deploy Blueprint
          </Button>
        </CardContent>
      </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{modalTitle}</DialogTitle>
                    <DialogDescription>{modalDescription}</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {renderAiResult()}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
