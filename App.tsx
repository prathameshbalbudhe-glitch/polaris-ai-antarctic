import { useEffect, useState } from 'react';
import { Check, ExternalLink, RotateCcw, ShieldAlert, X } from 'lucide-react';
import { Login } from '@/components/Login';
import { Layout } from '@/components/Layout';
import type { Iceberg, PageKey } from '@/types';
import { CommandCenter, NavigationPage, IcebergPage, RoutePage, RiskPage, AlertsPage, HistoryPage, SettingsPage } from '@/pages/Pages';
import { GlassCard, RiskBadge } from '@/components/ui';
import { fetchDashboard } from '@/lib/api';
import { setLiveData } from '@/data/mockData';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState<PageKey>('command');
  const [selectedIceberg, setSelectedIceberg] = useState<Iceberg | null>(null);
  const [presentation, setPresentation] = useState(false);
  const [dataState, setDataState] = useState<'loading' | 'live' | 'mixed'>('loading');
  const [lastSync, setLastSync] = useState('connecting…');

  useEffect(() => {
    const controller = new AbortController();
    let timer: number | undefined;

    const sync = async () => {
      try {
        const payload = await fetchDashboard(controller.signal);
        setLiveData(payload);
        const allLive = Boolean(payload.sources.USNIC && payload.sources.CopernicusMarine && payload.sources.VesselAIS);
        setDataState(allLive ? 'live' : 'mixed');
        setLastSync(new Date(payload.timestamp).toISOString().slice(11, 19) + ' UTC');
      } catch {
        setDataState('mixed');
        setLastSync('backend unavailable · demo fallback');
      } finally {
        timer = window.setTimeout(sync, 300_000);
      }
    };

    sync();
    return () => {
      controller.abort();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!authenticated) return <Login onLogin={() => setAuthenticated(true)} />;

  const navigate = (nextPage: PageKey) => { setPage(nextPage); setSelectedIceberg(null); };
  const openIceberg = (iceberg: Iceberg) => setSelectedIceberg(iceberg);
  const sourceLabel = dataState === 'live' ? 'LIVE DATA' : dataState === 'loading' ? 'SYNCING DATA' : 'MIXED / FALLBACK';
  const sourceColor = dataState === 'live' ? '#10b981' : dataState === 'loading' ? '#38b6ff' : '#f59e0b';

  return <>
    <Layout page={page} onNavigate={navigate} onLogout={() => setAuthenticated(false)} presentation={presentation} onPresentation={() => setPresentation(!presentation)}>
      <div className="mb-4 flex items-center justify-between rounded-md border border-[#243049] bg-[#0a0f1a]/80 px-3 py-2 text-[9px] backdrop-blur">
        <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sourceColor }} /><span className="font-semibold uppercase tracking-[0.14em]" style={{ color: sourceColor }}>{sourceLabel}</span><span className="text-[#5a6a7e]">POLARIS data gateway</span></div>
        <span className="font-mono text-[#5a6a7e]">LAST SYNC {lastSync}</span>
      </div>
      {page === 'command' && <CommandCenter onIceberg={openIceberg} onNavigate={navigate} presentation={presentation} />}
      {page === 'navigation' && <NavigationPage onIceberg={openIceberg} />}
      {page === 'iceberg' && <IcebergPage onIceberg={openIceberg} />}
      {page === 'route' && <RoutePage />}
      {page === 'risk' && <RiskPage />}
      {page === 'alerts' && <AlertsPage onIceberg={openIceberg} onNavigate={navigate} />}
      {page === 'history' && <HistoryPage />}
      {page === 'settings' && <SettingsPage />}
    </Layout>
    {selectedIceberg && <IcebergModal iceberg={selectedIceberg} onClose={() => setSelectedIceberg(null)} onNavigate={navigate} />}
    <footer className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none hidden justify-center pb-1 lg:flex"><span className="rounded-full bg-[#050810]/80 px-4 py-1 text-[8px] tracking-wide text-[#5a6a7e] backdrop-blur">POLARIS AI is a decision-support prototype. Live feeds are shown only when configured; unavailable feeds remain clearly labeled as fallback data. Final navigation decisions remain with qualified human operators.</span></footer>
  </>;
}

function IcebergModal({ iceberg, onClose, onNavigate }: { iceberg: Iceberg; onClose: () => void; onNavigate: (page: PageKey) => void }) {
  const predictionStatus = (iceberg as Iceberg & { predictionStatus?: string }).predictionStatus;
  const dataSource = (iceberg as Iceberg & { dataSource?: string }).dataSource;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}><div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
  <GlassCard className="relative border-[#38b6ff]/25 bg-[#0d1420] shadow-2xl animate-scale-in"><button onClick={onClose} className="absolute right-4 top-4 text-[#5a6a7e] transition hover:text-[#e8eef5]"><X size={18} /></button><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ef4444]/10 text-[#ef4444]"><ShieldAlert size={24} /></div><div><div className="flex items-center gap-3"><p className="font-mono text-xl font-semibold text-[#e8eef5]">{iceberg.id}</p><RiskBadge risk={iceberg.risk} /></div><p className="mt-1 text-xs text-[#5a6a7e]">{dataSource || 'Prototype contact'} · Detected {iceberg.detectedAt}</p></div></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Distance', `${iceberg.distance} NM`], ['Movement', `${iceberg.movementDir} · ${iceberg.speed} kt`], ['Confidence', `${iceberg.confidence}%`], ['Clearance', `${iceberg.recommendedClearance} NM`]].map(([label, value]) => <div key={label} className="rounded-lg border border-[#243049] bg-[#111927] p-3"><p className="text-[9px] uppercase tracking-wider text-[#5a6a7e]">{label}</p><p className="mt-1 font-mono text-xs text-[#e8eef5]">{value}</p></div>)}</div><div className="mt-5 rounded-lg border border-[#243049] bg-[#111927] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8a9bb0]">Prediction status</p><div className="mt-3 flex items-center justify-between"><div><p className="font-mono text-sm text-[#e8eef5]">{predictionStatus || 'Prototype trajectory model'}</p><p className="mt-1 text-[9px] text-[#5a6a7e]">24-hour decision-support horizon</p></div><span className="rounded-md border border-[#38b6ff]/20 bg-[#0077b6]/10 px-2 py-1 text-[9px] text-[#38b6ff]">{dataSource || 'SIMULATION'}</span></div></div><div className="mt-5 flex items-start gap-2 rounded-md border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-3 text-[10px] leading-relaxed text-[#f5c56b]"><ExternalLink size={14} className="mt-0.5 shrink-0" />Live source coordinates are not the same as a validated collision forecast. Prediction outputs remain decision-support estimates for demonstration.</div><div className="mt-6 flex flex-wrap gap-2"><button onClick={() => onNavigate('iceberg')} className="flex items-center gap-2 rounded-md bg-[#0077b6] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0099e6]"><Check size={13} />View prediction</button><button onClick={() => onNavigate('risk')} className="flex items-center gap-2 rounded-md border border-[#243049] px-3 py-2 text-[10px] text-[#8a9bb0] hover:border-[#38b6ff]/30 hover:text-[#e8eef5]"><ShieldAlert size={13} />Calculate risk</button><button onClick={() => onNavigate('route')} className="flex items-center gap-2 rounded-md border border-[#243049] px-3 py-2 text-[10px] text-[#8a9bb0] hover:border-[#38b6ff]/30 hover:text-[#e8eef5]"><RotateCcw size={13} />Recalculate route</button></div></GlassCard>
  </div></div>;
}

export default App;
