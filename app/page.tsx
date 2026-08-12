"use client";

import { useMemo, useState } from "react";

type Material = { name: string; requirements: Record<number, number> };
type Cauldron = { id: string; name: string; mark: string; tone: string; materials: [Material, Material]; rows: Array<[number, number, number, number]> };

const CAULDRONS: Cauldron[] = [
  { id: "copper", name: "구리 가마솥", mark: "Cu", tone: "copper", materials: [
    { name: "구리조각", requirements: { 0: 12500, 1: 5000 } }, { name: "진흙", requirements: { 0: 5000, 1: 2500 } },
  ], rows: [[1, 5000, 0, 5000], [0, 12500, 1, 2500]] },
  { id: "silver", name: "은 가마솥", mark: "Ag", tone: "silver", materials: [
    { name: "은광석", requirements: { 0: 62000, 1: 31000, 2: 12500, 3: 5000 } }, { name: "진흙", requirements: { 0: 31000, 1: 12500, 2: 5000 } },
  ], rows: [[3, 5000, 2, 5000], [2, 12500, 1, 12500], [1, 31000, 0, 31000], [0, 62000, 0, 31000]] },
  { id: "gold", name: "금 가마솥", mark: "Au", tone: "gold", materials: [
    { name: "금빛 결정", requirements: { 0: 60000, 1: 28000, 2: 12500, 3: 5000 } }, { name: "진흙", requirements: { 0: 130000, 1: 60000, 2: 28000, 3: 12500, 4: 5000 } },
  ], rows: [[3, 5000, 4, 5000], [2, 12500, 3, 12500], [1, 28000, 2, 28000], [0, 60000, 1, 60000], [0, 60000, 0, 130000]] },
  { id: "rune", name: "룬 가마솥", mark: "ᚱ", tone: "rune", materials: [
    { name: "복원된 석판", requirements: { 0: 130000, 1: 60000, 2: 28000, 3: 12500, 4: 5000 } }, { name: "진흙", requirements: { 0: 280000, 1: 130000, 2: 60000, 3: 28000, 4: 12500, 5: 5000 } },
  ], rows: [[4, 5000, 5, 5000], [3, 12500, 4, 12500], [2, 28000, 3, 28000], [1, 60000, 2, 60000], [0, 130000, 1, 130000], [0, 130000, 0, 280000]] },
];

type FiveOption = { item: string; level: number; count: number };
type FiveCauldron = { id: string; name: string; mark: string; tone: string; first: FiveOption[]; second: FiveOption[]; fixed?: [FiveOption, FiveOption][]; note?: string };

const FIVE_CAULDRONS: FiveCauldron[] = [
  { id: "copper", name: "구리 가마솥", mark: "Cu", tone: "copper", first: [{ item: "진흙", level: 0, count: 70 }], second: [{ item: "구리조각", level: 1, count: 70 }, { item: "구리조각", level: 0, count: 182 }] },
  { id: "silver", name: "은 가마솥", mark: "Ag", tone: "silver", first: [{ item: "진흙", level: 2, count: 70 }, { item: "진흙", level: 1, count: 182 }, { item: "진흙", level: 0, count: 474 }], second: [{ item: "은광석", level: 3, count: 70 }, { item: "은광석", level: 2, count: 182 }, { item: "은광석", level: 1, count: 474 }, { item: "은광석", level: 0, count: 1231 }], fixed: [[{ item: "진흙", level: 1, count: 80 }, { item: "은광석", level: 4, count: 80 }]], note: "+4 은광석은 고정 비율만 가능합니다." },
  { id: "gold", name: "금 가마솥", mark: "Au", tone: "gold", first: [{ item: "진흙", level: 4, count: 70 }, { item: "진흙", level: 3, count: 182 }, { item: "진흙", level: 2, count: 474 }, { item: "진흙", level: 1, count: 1231 }, { item: "진흙", level: 0, count: 3199 }], second: [{ item: "금빛 결정", level: 3, count: 70 }, { item: "금빛 결정", level: 2, count: 182 }, { item: "금빛 결정", level: 1, count: 474 }, { item: "금빛 결정", level: 0, count: 1231 }, { item: "마력결정", level: 0, count: 3700 }, { item: "마력결정", level: 1, count: 1400 }, { item: "마력결정", level: 2, count: 1400 }, { item: "황금덩어리", level: 0, count: 1400 }, { item: "황금덩어리", level: 1, count: 1400 }], fixed: [[{ item: "진흙", level: 3, count: 80 }, { item: "금빛 결정", level: 4, count: 80 }]], note: "금빛 결정 대신 마력결정 또는 황금덩어리를 선택할 수 있습니다." },
  { id: "rune", name: "룬 가마솥", mark: "ᚱ", tone: "rune", first: [], second: [], note: "요청 시 메뉴가 추가됩니다. 교환 비율은 이화에게 문의해 주세요." },
];

const fmt = (n: number) => Math.ceil(n).toLocaleString("ko-KR");
const percent = (n: number) => `${(n * 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}%`;

function MaterialInputs({ material, values, onChange, discount }: { material: Material; values: Record<number, number>; onChange: (level: number, value: number) => void; discount: boolean }) {
  const levels = Object.keys(material.requirements).map(Number).sort((a, b) => b - a);
  const contribution = levels.reduce((sum, level) => sum + (values[level] || 0) / (material.requirements[level] * (discount ? .8 : 1)), 0);
  return <section className="material-card">
    <div className="material-title"><div><span className="material-dot" />{material.name}</div><strong>{contribution.toFixed(3)} <small>교환분</small></strong></div>
    <div className="material-progress"><i style={{ width: `${Math.min(100, contribution * 100)}%` }} /></div>
    <div className="input-list">{levels.map((level) => {
      const required = material.requirements[level] * (discount ? .8 : 1);
      return <label key={level} className="amount-row"><span className="level">+{level}</span><input inputMode="numeric" min="0" type="number" placeholder="0" value={values[level] || ""} onChange={(e) => onChange(level, Math.max(0, Number(e.target.value) || 0))} /><span className="unit">개</span><small>100% = {fmt(required)}</small></label>;
    })}</div>
  </section>;
}

function TenCalculator() {
  const [selectedId, setSelectedId] = useState("silver");
  const [discount, setDiscount] = useState(false);
  const [inventory, setInventory] = useState<Record<string, [Record<number, number>, Record<number, number>]>>({});
  const selected = CAULDRONS.find((item) => item.id === selectedId) || CAULDRONS[0];
  const values = inventory[selected.id] || [{}, {}];
  const result = useMemo(() => {
    const units = selected.materials.map((material, index) => Object.entries(material.requirements).reduce((sum, [level, amount]) => sum + ((values[index][Number(level)] || 0) / (amount * (discount ? .8 : 1))), 0));
    return { units, exchangeable: Math.floor(Math.min(...units) + 1e-10), limiting: units[0] <= units[1] ? 0 : 1 };
  }, [discount, selected, values]);
  const update = (materialIndex: number, level: number, value: number) => setInventory((current) => {
    const pair: [Record<number, number>, Record<number, number>] = [{ ...(current[selected.id]?.[0] || {}) }, { ...(current[selected.id]?.[1] || {}) }];
    pair[materialIndex][level] = value; return { ...current, [selected.id]: pair };
  });
  const clear = () => setInventory((current) => ({ ...current, [selected.id]: [{}, {}] }));
  const nextTarget = result.exchangeable + 1;
  return <>
    <nav className="cauldron-tabs" aria-label="가마솥 선택">{CAULDRONS.map((item) => <button key={item.id} className={`${item.tone} ${selectedId === item.id ? "active" : ""}`} onClick={() => setSelectedId(item.id)}><span className="mark">{item.mark}</span><span><small>+10</small>{item.name}</span></button>)}</nav>
    <div className="workspace">
      <section className="calculator-panel">
        <div className="panel-head"><div><span className={`pot-icon ${selected.tone}`}>{selected.mark}</span><div><small>선택한 교환품</small><h2>+10 {selected.name}</h2></div></div><label className="discount-toggle"><input type="checkbox" checked={discount} onChange={(e) => setDiscount(e.target.checked)} /><span className="switch" /><span><b>첫 거래 할인</b><small>필요 수량 20% 할인</small></span></label></div>
        <div className="material-grid">{selected.materials.map((material, index) => <MaterialInputs key={`${selected.id}-${material.name}-${index}`} material={material} values={values[index]} onChange={(level, value) => update(index, level, value)} discount={discount} />)}</div>
        <div className="result-card"><div className="result-main"><small>교환 가능 수량</small><strong>{result.exchangeable}<span>개</span></strong><p>+10 {selected.name}</p></div><div className="result-detail">{selected.materials.map((material, index) => {
          const lacking = Math.max(0, nextTarget - result.units[index]);
          return <div key={material.name + index}><span>{material.name}</span><b>{result.units[index].toFixed(3)}회분</b><div className="thin-progress"><i style={{ width: `${Math.min(100, (result.units[index] % 1 || (result.units[index] ? 1 : 0)) * 100)}%` }} /></div><small>{lacking > 0 ? `다음 1개까지 ${percent(lacking)} 부족` : "충족"}</small></div>;
        })}<p className="limit-note"><span>!</span> 두 재료 중 <b>{selected.materials[result.limiting].name}</b>이 교환 수량을 결정합니다.</p></div><button className="clear-button" onClick={clear}>입력 초기화</button></div>
      </section>
      <aside className="guide-panel"><div className="guide-title"><span>기준표</span><b>+10 {selected.name}</b></div><div className="reference-list">{selected.rows.map(([aLevel, aCount, bLevel, bCount], index) => <div className="reference-row" key={index}><span className="combo-number">{String(index + 1).padStart(2, "0")}</span><div><b>+{aLevel} {selected.materials[0].name}</b><span>{fmt(aCount * (discount ? .8 : 1))}개</span></div><i>+</i><div><b>+{bLevel} {selected.materials[1].name}</b><span>{fmt(bCount * (discount ? .8 : 1))}개</span></div></div>)}</div>
        <div className="rule-box"><h3>혼합 계산 규칙</h3><p>같은 재료의 서로 다른 강화도를 섞으면 각 수량의 교환 기여도를 더합니다.</p><div className="example"><span>예시</span><p><b>+2 진흙 2,500</b> = 50%<br /><b>+1 진흙 6,250</b> = 50%<br /><strong>합계 100% ✓</strong></p></div><ul><li>두 종류의 제작 재료가 모두 필요합니다.</li><li>나누어떨어지지 않는 수량은 올림 처리합니다.</li><li>가마솥 자체는 교환 재료로 받지 않습니다.</li></ul></div>
      </aside>
    </div><footer><span>+</span>10 NOA CAULDRON EXCHANGE <i /> 재료 기준 계산 도구</footer>
  </>;
}

function FiveCalculator() {
  const [selectedId, setSelectedId] = useState("silver");
  const [quantity, setQuantity] = useState(1);
  const [firstIndex, setFirstIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(0);
  const [fixedIndex, setFixedIndex] = useState<number | null>(null);
  const selected = FIVE_CAULDRONS.find((item) => item.id === selectedId) || FIVE_CAULDRONS[0];
  const chooseCauldron = (id: string) => { setSelectedId(id); setFirstIndex(0); setSecondIndex(0); setFixedIndex(null); };
  const first = fixedIndex == null ? selected.first[firstIndex] : selected.fixed?.[fixedIndex][0];
  const second = fixedIndex == null ? selected.second[secondIndex] : selected.fixed?.[fixedIndex][1];
  const optionLabel = (option: FiveOption) => `+${option.level} ${option.item} · ${fmt(option.count)}개`;

  return <>
    <nav className="cauldron-tabs five-tabs" aria-label="+5 가마솥 선택">{FIVE_CAULDRONS.map((item) => <button key={item.id} className={`${item.tone} ${selectedId === item.id ? "active" : ""}`} onClick={() => chooseCauldron(item.id)}><span className="mark">{item.mark}</span><span><small>+5 · 이화</small>{item.name}</span></button>)}</nav>
    {selected.id === "rune" ? <div className="five-empty"><span className="pot-icon rune">ᚱ</span><small>이화의 +5 교환</small><h2>룬 가마솥은 요청 시 추가됩니다</h2><p>현재 안내된 교환 비율이 없습니다.<br />이화에게 직접 문의해 주세요.</p></div> : <div className="workspace five-workspace">
      <section className="calculator-panel">
        <div className="panel-head"><div><span className={`pot-icon ${selected.tone}`}>{selected.mark}</span><div><small>이화의 교환품</small><h2>+5 {selected.name}</h2></div></div><label className="quantity-field"><span>교환 수량</span><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))} /><b>개</b></label></div>
        <div className="five-notice"><b>이미 최대 할인가입니다.</b><span>추가 할인 및 에누리는 적용되지 않습니다.</span></div>
        <div className="choice-grid">
          <section className={`choice-card ${fixedIndex != null ? "dimmed" : ""}`}><div className="choice-heading"><span>선택 1</span><b>첫 번째 제작 재료</b></div>{selected.first.map((option, index) => <button key={`${option.item}-${option.level}`} className={fixedIndex == null && firstIndex === index ? "selected" : ""} onClick={() => { setFixedIndex(null); setFirstIndex(index); }}><i>+{option.level}</i><span>{option.item}</span><b>{fmt(option.count * quantity)}개</b></button>)}</section>
          <div className="choice-plus">+</div>
          <section className={`choice-card ${fixedIndex != null ? "dimmed" : ""}`}><div className="choice-heading"><span>선택 2</span><b>두 번째 제작 재료</b></div>{selected.second.map((option, index) => <button key={`${option.item}-${option.level}-${index}`} className={fixedIndex == null && secondIndex === index ? "selected" : ""} onClick={() => { setFixedIndex(null); setSecondIndex(index); }}><i>+{option.level}</i><span>{option.item}</span><b>{fmt(option.count * quantity)}개</b></button>)}</section>
        </div>
        {selected.fixed?.length ? <div className="fixed-options"><div><span>비율 고정</span><p>{selected.note}</p></div>{selected.fixed.map((pair, index) => <button key={index} className={fixedIndex === index ? "selected" : ""} onClick={() => setFixedIndex(fixedIndex === index ? null : index)}><b>{optionLabel(pair[0])}</b><i>+</i><b>{optionLabel(pair[1])}</b></button>)}</div> : null}
        <div className="five-result"><div><small>우편으로 보낼 재료</small><strong>{quantity}<span>개 교환분</span></strong></div><div className="mail-items"><p><i>1</i><span>+{first?.level} {first?.item}</span><b>{fmt((first?.count || 0) * quantity)}개</b></p><em>+</em><p><i>2</i><span>+{second?.level} {second?.item}</span><b>{fmt((second?.count || 0) * quantity)}개</b></p></div></div>
      </section>
      <aside className="guide-panel five-guide"><div className="guide-title"><span>거래 안내</span><b>판매자 · 이화</b></div><ol><li><b>가마솥과 수량 선택</b><span>원하는 +5 가마솥과 교환 개수를 선택합니다.</span></li><li><b>선택 1 + 선택 2</b><span>각 영역에서 재료를 하나씩 고릅니다.</span></li><li><b>재료 선입금</b><span>계산된 두 재료를 이화에게 우편으로 보냅니다.</span></li><li><b>+5 솥 수령</b><span>확인 후 해당 +5 가마솥을 받습니다.</span></li></ol><div className="five-warning"><b>꼭 확인해 주세요</b><p>가마솥 제작 재료 두 종류가 모두 필요합니다. 이 비율은 이미 최대 할인가이며 추가 할인은 없습니다.</p></div></aside>
    </div>}
    <footer><span>+</span>5 IHWA CAULDRON EXCHANGE <i /> 선택 1 + 선택 2 = +5 솥</footer>
  </>;
}

export default function Home() {
  const [seller, setSeller] = useState<"noa" | "ihwa">("noa");
  return <main>
    <header className="hero"><div className="eyebrow"><span>ALCANTHIA EXCHANGE</span><i /></div><h1>가마솥 <em>교환 계산기</em></h1><p>{seller === "noa" ? <>보유 재료를 혼합 계산해 <b>노아의 +10 가마솥</b>으로 교환합니다.</> : <>선택 1과 선택 2를 조합해 <b>이화의 +5 가마솥</b>으로 교환합니다.</>}</p></header>
    <nav className="seller-tabs" aria-label="판매자 선택"><button className={seller === "noa" ? "active" : ""} onClick={() => setSeller("noa")}><span>01</span><div><small>판매자 · 노아</small><b>+10 가마솥</b></div><i>혼합 계산 · 첫 거래 할인</i></button><button className={seller === "ihwa" ? "active" : ""} onClick={() => setSeller("ihwa")}><span>02</span><div><small>판매자 · 이화</small><b>+5 가마솥</b></div><i>최대 할인가 · 선택식 교환</i></button></nav>
    {seller === "noa" ? <TenCalculator /> : <FiveCalculator />}
  </main>;
}
