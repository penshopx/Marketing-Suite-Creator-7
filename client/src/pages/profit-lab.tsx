import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Calculator, TrendingUp, TrendingDown, Target,
  Zap, AlertTriangle, CheckCircle2, BarChart2,
  DollarSign, ArrowRight, RotateCcw, Info,
  Percent, ShoppingBag, Megaphone, FlaskConical,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(n));
}

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

function MetricCard({
  label, value, sub, color = "default", icon: Icon,
}: {
  label: string; value: string; sub?: string; color?: "default" | "green" | "red" | "yellow" | "blue"; icon?: React.ElementType;
}) {
  const colorMap = {
    default: "bg-card border",
    green: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    red: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    yellow: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
    blue: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  };
  const textMap = {
    default: "text-foreground",
    green: "text-green-700 dark:text-green-400",
    red: "text-red-700 dark:text-red-400",
    yellow: "text-yellow-700 dark:text-yellow-400",
    blue: "text-blue-700 dark:text-blue-400",
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && <Icon className={`h-3.5 w-3.5 ${textMap[color]}`} />}
      </div>
      <p className={`text-xl font-bold ${textMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function NumInput({
  label, value, onChange, prefix = "Rp", hint, testId,
}: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string; hint?: string; testId?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">{prefix}</span>
        <Input
          className={`pl-${prefix.length > 2 ? "10" : "8"} text-sm`}
          style={{ paddingLeft: `${prefix.length * 7 + 12}px` }}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="0"
          data-testid={testId}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// =========================================================
// TAB 1: ROAS & PROFIT CALCULATOR
// =========================================================
function RoasCalculator() {
  const [hargaJual, setHargaJual] = useState("297000");
  const [hargaModal, setHargaModal] = useState("80000");
  const [ongkir, setOngkir] = useState("0");
  const [adSpend, setAdSpend] = useState("500000");
  const [konversi, setKonversi] = useState("10");

  const r = useMemo(() => {
    const hj = parseFloat(hargaJual) || 0;
    const hm = parseFloat(hargaModal) || 0;
    const ok = parseFloat(ongkir) || 0;
    const ads = parseFloat(adSpend) || 0;
    const k = parseFloat(konversi) || 0;

    const totalRevenue = hj * k;
    const totalCOGS = (hm + ok) * k;
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - ads;
    const roas = ads > 0 ? totalRevenue / ads : 0;
    const marginPerUnit = hj > 0 ? ((hj - hm - ok) / hj) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const beRoas = hj > 0 ? hj / (hj - hm - ok) : 0;
    const cpa = k > 0 ? ads / k : 0;
    const maxCpa = hj - hm - ok;
    const status = netProfit > 0 ? "profit" : netProfit === 0 ? "bep" : "rugi";

    return { totalRevenue, totalCOGS, grossProfit, netProfit, roas, marginPerUnit, netMargin, beRoas, cpa, maxCpa, status, k, hj };
  }, [hargaJual, hargaModal, ongkir, adSpend, konversi]);

  const reset = () => { setHargaJual("297000"); setHargaModal("80000"); setOngkir("0"); setAdSpend("500000"); setKonversi("10"); };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            Data Produk & Iklan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <NumInput label="Harga Jual Produk" value={hargaJual} onChange={setHargaJual} testId="input-roas-price" />
          <NumInput label="Harga Modal / COGS" value={hargaModal} onChange={setHargaModal} hint="Termasuk packaging, produksi" testId="input-roas-cogs" />
          <NumInput label="Ongkos Kirim (jika ditanggung)" value={ongkir} onChange={setOngkir} testId="input-roas-ongkir" />
          <div className="border-t pt-3">
            <NumInput label="Total Budget Iklan" value={adSpend} onChange={setAdSpend} testId="input-roas-spend" />
            <div className="mt-3">
              <NumInput label="Jumlah Konversi / Penjualan" value={konversi} onChange={setKonversi} prefix="#" hint="Berapa order yang dihasilkan dari iklan ini" testId="input-roas-conv" />
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={reset}>
            <RotateCcw className="h-3 w-3 mr-1.5" />Reset ke contoh default
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 border-2 flex items-center gap-3 ${
          r.status === "profit" ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700" :
          r.status === "rugi" ? "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700" :
          "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700"
        }`}>
          {r.status === "profit"
            ? <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
            : r.status === "rugi"
            ? <TrendingDown className="h-8 w-8 text-red-500 flex-shrink-0" />
            : <AlertTriangle className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          }
          <div>
            <p className={`font-bold text-lg ${r.status === "profit" ? "text-green-700 dark:text-green-400" : r.status === "rugi" ? "text-red-700 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400"}`}>
              {r.status === "profit" ? "PROFIT ✅" : r.status === "rugi" ? "RUGI ❌" : "BREAK EVEN ⚖️"}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.status === "profit"
                ? `Untung bersih Rp ${fmt(r.netProfit)} dari ${r.k} transaksi`
                : r.status === "rugi"
                ? `Merugi Rp ${fmt(Math.abs(r.netProfit))} — perlu optimasi`
                : "Tidak untung tidak rugi — perlu scale up"
              }
            </p>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="ROAS" value={`${r.roas.toFixed(2)}x`} sub={`Need ≥ ${r.beRoas.toFixed(2)}x BEP`} color={r.roas >= r.beRoas ? "green" : "red"} icon={BarChart2} />
          <MetricCard label="Net Profit" value={`Rp ${fmt(r.netProfit)}`} sub={`Margin ${fmtPct(r.netMargin)}`} color={r.netProfit > 0 ? "green" : "red"} icon={r.netProfit > 0 ? TrendingUp : TrendingDown} />
          <MetricCard label="Break-Even ROAS" value={`${r.beRoas.toFixed(2)}x`} sub="ROAS minimum impas" color="blue" icon={Target} />
          <MetricCard label="CPA" value={`Rp ${fmt(r.cpa)}`} sub={`Max CPA: Rp ${fmt(r.maxCpa)}`} color={r.cpa <= r.maxCpa ? "green" : "red"} icon={DollarSign} />
        </div>

        {/* Breakdown */}
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Ringkasan Keuangan</p>
            <div className="space-y-1.5">
              {[
                { label: "Total Revenue", value: `Rp ${fmt(r.totalRevenue)}`, color: "text-green-600 dark:text-green-400" },
                { label: "Total Modal (COGS)", value: `- Rp ${fmt(r.totalCOGS)}`, color: "text-red-500" },
                { label: "Gross Profit", value: `Rp ${fmt(r.grossProfit)}`, color: "text-foreground font-semibold" },
                { label: "Budget Iklan", value: `- Rp ${fmt(parseFloat(adSpend) || 0)}`, color: "text-red-500" },
                { label: "Net Profit", value: `Rp ${fmt(r.netProfit)}`, color: r.netProfit >= 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-red-600 dark:text-red-400 font-bold" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={color}>{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {r.cpa > r.maxCpa && (
          <div className="flex items-start gap-2 text-xs bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-600 dark:text-red-400">CPA terlalu tinggi. Kamu harus <strong>turunkan CPA</strong> di bawah Rp {fmt(r.maxCpa)} atau <strong>naikkan harga jual</strong> untuk bisa profit.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// TAB 2: BREAK-EVEN ANALYZER
// =========================================================
function BreakEvenAnalyzer() {
  const [hargaJual, setHargaJual] = useState("297000");
  const [hargaModal, setHargaModal] = useState("80000");
  const [adSpend, setAdSpend] = useState("500000");
  const [ctr, setCtr] = useState("1.5");
  const [cpc, setCpc] = useState("1500");

  const r = useMemo(() => {
    const hj = parseFloat(hargaJual) || 0;
    const hm = parseFloat(hargaModal) || 0;
    const ads = parseFloat(adSpend) || 0;
    const ctrVal = parseFloat(ctr) || 0;
    const cpcVal = parseFloat(cpc) || 0;

    const profitPerUnit = hj - hm;
    const beRoas = hj > 0 ? hj / profitPerUnit : 0;
    const beKonversi = profitPerUnit > 0 ? Math.ceil(ads / profitPerUnit) : 0;
    const beCr = cpcVal > 0 ? (cpcVal / hj) * 100 : 0;
    const estimasiKlik = cpcVal > 0 ? Math.floor(ads / cpcVal) : 0;
    const estimasiOrder = ctrVal > 0 && cpcVal > 0 ? Math.floor(estimasiKlik * (beCr / 100)) : 0;
    const maxSpend = profitPerUnit > 0 ? Infinity : 0;

    return { profitPerUnit, beRoas, beKonversi, beCr, estimasiKlik, maxSpend };
  }, [hargaJual, hargaModal, adSpend, ctr, cpc]);

  const reset = () => { setHargaJual("297000"); setHargaModal("80000"); setAdSpend("500000"); setCtr("1.5"); setCpc("1500"); };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Data untuk Break-Even
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <NumInput label="Harga Jual" value={hargaJual} onChange={setHargaJual} testId="input-be-price" />
          <NumInput label="Harga Modal / COGS" value={hargaModal} onChange={setHargaModal} testId="input-be-cogs" />
          <NumInput label="Budget Iklan" value={adSpend} onChange={setAdSpend} testId="input-be-spend" />
          <div className="border-t pt-3 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Data Iklan (opsional untuk estimasi)</p>
            <NumInput label="CPC Rata-rata" value={cpc} onChange={setCpc} hint="Cost per click dari Meta/TikTok Ads" testId="input-be-cpc" />
            <NumInput label="CTR (%)" value={ctr} onChange={setCtr} prefix="%" hint="Click-through rate iklan kamu" testId="input-be-ctr" />
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={reset}>
            <RotateCcw className="h-3 w-3 mr-1.5" />Reset
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="Break-Even ROAS" value={`${r.beRoas.toFixed(2)}x`} sub="ROAS minimum untuk impas" color="blue" icon={Target} />
          <MetricCard label="Profit per Unit" value={`Rp ${fmt(r.profitPerUnit)}`} sub="Sebelum dipotong iklan" color="green" icon={DollarSign} />
          <MetricCard label="Order Minimum BEP" value={`${r.beKonversi} order`} sub={`Dari budget Rp ${fmt(parseFloat(adSpend) || 0)}`} color="yellow" icon={ShoppingBag} />
          <MetricCard label="CR Minimum BEP" value={`${r.beCr.toFixed(2)}%`} sub="Conversion rate yang dibutuhkan" color="blue" icon={Percent} />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Simulasi CR vs Profit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[0.5, 1, 1.5, 2, 3, 5].map((crRate) => {
              const hj = parseFloat(hargaJual) || 0;
              const hm = parseFloat(hargaModal) || 0;
              const ads = parseFloat(adSpend) || 0;
              const cpcVal = parseFloat(cpc) || 0;
              const klik = cpcVal > 0 ? ads / cpcVal : 0;
              const orders = klik * (crRate / 100);
              const profit = orders * (hj - hm) - ads;
              const isBep = Math.abs(crRate - r.beCr) < 0.3;
              return (
                <div key={crRate} className={`flex items-center gap-3 py-1.5 px-2 rounded ${isBep ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200" : ""}`}>
                  <span className="text-xs w-12 text-muted-foreground">{crRate}% CR</span>
                  <div className="flex-1">
                    <Progress
                      value={Math.min(100, Math.max(0, profit > 0 ? (profit / (parseFloat(adSpend) || 1)) * 100 : 0))}
                      className="h-2"
                    />
                  </div>
                  <span className={`text-xs w-28 text-right font-medium ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                    {profit >= 0 ? "+" : ""}Rp {fmt(profit)}
                  </span>
                  {isBep && <Badge variant="outline" className="text-xs py-0 h-4 border-yellow-400">BEP</Badge>}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Berdasarkan CPC Rp {fmt(parseFloat(cpc) || 0)} dan budget Rp {fmt(parseFloat(adSpend) || 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =========================================================
// TAB 3: SCALING SIMULATOR
// =========================================================
function ScalingSimulator() {
  const [hargaJual, setHargaJual] = useState("297000");
  const [hargaModal, setHargaModal] = useState("80000");
  const [adSpend, setAdSpend] = useState("500000");
  const [konversi, setKonversi] = useState("10");
  const [scaleMultiplier, setScaleMultiplier] = useState([2]);
  const [crDropFactor, setCrDropFactor] = useState([15]);

  const base = useMemo(() => {
    const hj = parseFloat(hargaJual) || 0;
    const hm = parseFloat(hargaModal) || 0;
    const ads = parseFloat(adSpend) || 0;
    const k = parseFloat(konversi) || 0;
    const cr = ads > 0 && hj > 0 ? (k / (ads / hj)) * 100 : 0;
    const netProfit = (hj - hm) * k - ads;
    const roas = ads > 0 ? (hj * k) / ads : 0;
    return { hj, hm, ads, k, netProfit, roas, cr };
  }, [hargaJual, hargaModal, adSpend, konversi]);

  const scenarios = useMemo(() => {
    return [2, 3, 5, 10].map((mult) => {
      const newSpend = base.ads * mult;
      const crDropPct = crDropFactor[0] / 100;
      // Higher budget usually means slightly worse CR due to audience saturation
      const crDegradation = 1 - (crDropPct * Math.log2(mult));
      const estimatedConv = base.k * mult * Math.max(0.5, crDegradation);
      const newRevenue = base.hj * estimatedConv;
      const newCOGS = base.hm * estimatedConv;
      const netProfit = newRevenue - newCOGS - newSpend;
      const newRoas = newSpend > 0 ? newRevenue / newSpend : 0;
      const profitMultiple = base.netProfit > 0 ? netProfit / base.netProfit : 0;
      return { mult, newSpend, estimatedConv: Math.round(estimatedConv), netProfit, newRoas, profitMultiple };
    });
  }, [base, crDropFactor]);

  const reset = () => { setHargaJual("297000"); setHargaModal("80000"); setAdSpend("500000"); setKonversi("10"); };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Data Saat Ini (Baseline)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Harga Jual" value={hargaJual} onChange={setHargaJual} testId="input-scale-price" />
              <NumInput label="Harga Modal" value={hargaModal} onChange={setHargaModal} testId="input-scale-cogs" />
              <NumInput label="Budget Saat Ini" value={adSpend} onChange={setAdSpend} testId="input-scale-spend" />
              <NumInput label="Konversi Saat Ini" value={konversi} onChange={setKonversi} prefix="#" testId="input-scale-conv" />
            </div>
            <div className="space-y-2 pt-1 border-t">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Asumsi CR drop per 2x scale</Label>
                <span className="text-sm font-bold text-primary">{crDropFactor[0]}%</span>
              </div>
              <Slider
                min={5} max={40} step={5}
                value={crDropFactor}
                onValueChange={setCrDropFactor}
                data-testid="slider-cr-drop"
              />
              <p className="text-xs text-muted-foreground">Semakin konservatif = CR drop makin besar ketika scale</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={reset}>
              <RotateCcw className="h-3 w-3 mr-1.5" />Reset
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase">Baseline Saat Ini</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-bold text-sm">Rp {fmt(base.ads)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className={`font-bold text-sm ${base.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>Rp {fmt(base.netProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                  <p className="font-bold text-sm">{base.roas.toFixed(2)}x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
            <Info className="h-3 w-3 flex-shrink-0" />
            Simulasi menggunakan model CR degradation — CR biasanya turun saat budget naik karena audience saturation
          </p>

          {scenarios.map((s) => (
            <div
              key={s.mult}
              className={`rounded-lg border p-3 ${s.netProfit > base.netProfit ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : "border-border"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={s.netProfit > base.netProfit ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}>
                    {s.mult}x Scale
                  </Badge>
                  <span className="text-xs text-muted-foreground">Budget: Rp {fmt(s.newSpend)}</span>
                </div>
                <span className={`text-sm font-bold ${s.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                  Rp {fmt(s.netProfit)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Est. Order</span>
                  <p className="font-semibold">{s.estimatedConv} pcs</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ROAS</span>
                  <p className="font-semibold">{s.newRoas.toFixed(2)}x</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Profit ×</span>
                  <p className={`font-semibold ${s.profitMultiple > 1 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                    {s.profitMultiple > 0 ? `${s.profitMultiple.toFixed(1)}x` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// TAB 4: PRICING CALCULATOR
// =========================================================
function PricingCalculator() {
  const [modal, setModal] = useState("80000");
  const [targetMargin, setTargetMargin] = useState([50]);
  const [targetRoas, setTargetRoas] = useState("3");
  const [adBudget, setAdBudget] = useState("500000");
  const [expectedOrder, setExpectedOrder] = useState("10");

  const r = useMemo(() => {
    const m = parseFloat(modal) || 0;
    const marginPct = targetMargin[0] / 100;
    const roas = parseFloat(targetRoas) || 0;
    const budget = parseFloat(adBudget) || 0;
    const orders = parseFloat(expectedOrder) || 1;

    const fromMargin = m > 0 && marginPct < 1 ? m / (1 - marginPct) : 0;
    const adCostPerUnit = orders > 0 ? budget / orders : 0;
    const fromRoas = roas > 0 ? adCostPerUnit * roas : 0;
    const recommended = Math.max(fromMargin, m + adCostPerUnit + 1);
    const sweetSpot = Math.round(recommended / 1000) * 1000;

    const tiers = [0.8, 1.0, 1.2, 1.5, 2.0].map((mult) => {
      const price = Math.round(sweetSpot * mult / 1000) * 1000;
      const marginPct2 = price > 0 ? ((price - m) / price) * 100 : 0;
      const profitPerUnit = price - m - adCostPerUnit;
      return { price, marginPct: marginPct2, profitPerUnit };
    });

    return { fromMargin, fromRoas, recommended: sweetSpot, adCostPerUnit, tiers };
  }, [modal, targetMargin, targetRoas, adBudget, expectedOrder]);

  const reset = () => { setModal("80000"); setTargetMargin([50]); setTargetRoas("3"); setAdBudget("500000"); setExpectedOrder("10"); };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Parameter Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <NumInput label="Harga Modal / COGS" value={modal} onChange={setModal} hint="Biaya produksi + packaging + ongkir" testId="input-price-cogs" />
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-sm">Target Margin Keuntungan</Label>
              <span className="text-sm font-bold text-primary">{targetMargin[0]}%</span>
            </div>
            <Slider min={10} max={80} step={5} value={targetMargin} onValueChange={setTargetMargin} data-testid="slider-target-margin" />
          </div>
          <div className="border-t pt-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Target dari Sisi Iklan</p>
            <NumInput label="Target ROAS" value={targetRoas} onChange={setTargetRoas} prefix="×" hint="Berapa ROAS yang kamu mau capai" testId="input-price-roas" />
            <NumInput label="Budget Iklan" value={adBudget} onChange={setAdBudget} testId="input-price-budget" />
            <NumInput label="Ekspektasi Order" value={expectedOrder} onChange={setExpectedOrder} prefix="#" testId="input-price-orders" />
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={reset}>
            <RotateCcw className="h-3 w-3 mr-1.5" />Reset
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Rekomendasi Harga Jual</p>
            <p className="text-4xl font-black text-primary">Rp {fmt(r.recommended)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ad cost per unit: Rp {fmt(r.adCostPerUnit)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Simulasi Tiering Harga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.tiers.map(({ price, marginPct, profitPerUnit }, i) => {
              const isRec = i === 1;
              return (
                <div key={price} className={`flex items-center gap-3 p-2.5 rounded-lg border ${isRec ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="w-24 flex-shrink-0">
                    <p className={`text-sm font-bold ${isRec ? "text-primary" : ""}`}>Rp {fmt(price)}</p>
                    {isRec && <Badge className="text-xs py-0 h-4 bg-primary">Rekomendasi</Badge>}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">Margin: <strong className={marginPct > 40 ? "text-green-600 dark:text-green-400" : ""}>{fmtPct(marginPct)}</strong></span>
                    <span className="text-muted-foreground">Profit/unit: <strong className={profitPerUnit > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}>Rp {fmt(profitPerUnit)}</strong></span>
                  </div>
                  <ArrowRight className={`h-4 w-4 ${isRec ? "text-primary" : "text-muted-foreground/30"}`} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-xs bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span className="text-blue-700 dark:text-blue-400">
            Harga dari margin: <strong>Rp {fmt(r.fromMargin)}</strong> — untuk dapat margin {targetMargin[0]}%. Selalu test A/B harga untuk menemukan sweet spot pasar.
          </span>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN PAGE
// =========================================================
export default function ProfitLab() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-primary" />
              Profit Lab
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Kalkulator lengkap untuk analisis profit, break-even, scaling, dan harga jual iklan
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-0">
            <Calculator className="h-3 w-3" />
            Real-time Calculator
          </Badge>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { icon: BarChart2, label: "ROAS & Profit", desc: "Hitung untung/rugi iklan" },
            { icon: Target, label: "Break-Even", desc: "Titik impas & CR minimum" },
            { icon: Zap, label: "Scaling Sim", desc: "Proyeksi saat scale budget" },
            { icon: DollarSign, label: "Pricing", desc: "Harga jual optimal" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="roas">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roas" className="text-xs" data-testid="tab-roas">
              <BarChart2 className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />ROAS & Profit
            </TabsTrigger>
            <TabsTrigger value="breakeven" className="text-xs" data-testid="tab-breakeven">
              <Target className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />Break-Even
            </TabsTrigger>
            <TabsTrigger value="scaling" className="text-xs" data-testid="tab-scaling">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />Scaling Sim
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs" data-testid="tab-pricing">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roas" className="mt-4"><RoasCalculator /></TabsContent>
          <TabsContent value="breakeven" className="mt-4"><BreakEvenAnalyzer /></TabsContent>
          <TabsContent value="scaling" className="mt-4"><ScalingSimulator /></TabsContent>
          <TabsContent value="pricing" className="mt-4"><PricingCalculator /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
