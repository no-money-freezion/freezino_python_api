// ─── Extra screens for Freezino UI Kit ─────────────────────────────────────
// Expects: window.I (icons), window.LangCtx, window.TIER_COLOR, window.TIER_LABEL
// Exposes: window.ExtraScreens = { Blackjack, Craps, Crash, HiLo, Topup, Onboarding,
//                                   Inbox, DailyBonus, History, WinModal, LoseScreen,
//                                   Settings, Leaderboard }

(function () {
  const { I, LangCtx } = window;
  const TIER_COLOR = window.TIER_COLOR || { common:'#8E8AAB', rare:'#4FC3F7', epic:'#B344FF', legendary:'#FFC839' };

  // Fallback translations helper — pulls from lang.common or falls back
  const _ = (lang, path, fb) => {
    try { return path.split('.').reduce((o,k)=>o&&o[k], lang) || fb; } catch { return fb; }
  };

  // ─── Blackjack (static hi-fi) ────────────────────────────────────────────
  function Blackjack({ balance }) {
    const lang = React.useContext(LangCtx);
    const dealer = [{ r:'Q', s:'♠', c:'#fff' }, { r:'?', s:'', c:'#555', hidden:true }];
    const player = [{ r:'10', s:'♥', c:'var(--accent)' }, { r:'8', s:'♣', c:'#fff' }];
    const Card = ({ r, s, c, hidden }) => (
      <div style={{
        width:86, height:120, borderRadius:8,
        background: hidden
          ? 'linear-gradient(135deg,var(--purple),var(--accent))'
          : 'linear-gradient(180deg,#fafafa,#e4e4e4)',
        border:'1px solid rgba(0,0,0,.4)',
        boxShadow:'0 8px 24px rgba(0,0,0,.5)',
        padding:10, display:'flex', flexDirection:'column', justifyContent:'space-between',
        color:c, fontFamily:'var(--font-serif)', fontSize:28, fontWeight:700,
        position:'relative', overflow:'hidden',
      }}>
        {hidden ? (
          <div style={{ margin:'auto', fontSize:36, color:'#fff', fontFamily:'var(--font-serif)', fontStyle:'italic' }}>F</div>
        ) : (<>
          <div>{r}<div style={{ fontSize:20, lineHeight:0.7 }}>{s}</div></div>
          <div style={{ alignSelf:'flex-end', transform:'rotate(180deg)' }}>
            {r}<div style={{ fontSize:20, lineHeight:0.7 }}>{s}</div>
          </div>
        </>)}
      </div>
    );
    return (
      <div className="container" style={{ padding:'32px 40px 80px' }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--purple)' }}>Table</div>
          <h1 className="h1">{lang.games.blackjack}</h1>
        </div>
        <div className="card-glow" style={{
          padding:48, background:'radial-gradient(ellipse at center,#1F3D2A,#0B1A12)',
          borderColor:'var(--gold-dim)', minHeight:520, position:'relative',
        }}>
          <div style={{ position:'absolute', inset:24, border:'2px solid rgba(255,200,57,.3)', borderRadius:120, pointerEvents:'none' }}/>
          {/* Dealer */}
          <div className="text-center mb-6" style={{ position:'relative', zIndex:1 }}>
            <div className="label mb-3" style={{ color:'var(--gold)' }}>Dealer · 10</div>
            <div className="row gap-2" style={{ justifyContent:'center' }}>
              {dealer.map((c,i)=><Card key={i} {...c}/>)}
            </div>
          </div>
          {/* Center message */}
          <div className="text-center mb-6" style={{ position:'relative', zIndex:1 }}>
            <div className="mono" style={{ fontSize:14, color:'var(--fg-3)', letterSpacing:'.1em' }}>
              BLACKJACK PAYS 3 TO 2
            </div>
          </div>
          {/* Player */}
          <div className="text-center" style={{ position:'relative', zIndex:1 }}>
            <div className="row gap-2 mb-3" style={{ justifyContent:'center' }}>
              {player.map((c,i)=><Card key={i} {...c}/>)}
            </div>
            <div className="mono" style={{ fontSize:32, fontWeight:700, color:'var(--gold-bright)',
                  textShadow:'var(--glow-gold)' }}>18</div>
          </div>
        </div>
        <div className="grid gap-3 mt-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
          {[
            { l:'Hit', c:'var(--green)' },{ l:'Stand', c:'var(--gold)' },
            { l:'Double', c:'var(--cyan)' },{ l:'Split', c:'var(--purple)' },
          ].map(b => (
            <button key={b.l} className="btn btn-lg"
                    style={{ background:`linear-gradient(135deg, ${b.c}, ${b.c}99)`,
                             color:'#0A0710', fontWeight:700 }}>{b.l}</button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Craps ───────────────────────────────────────────────────────────────
  function Craps() {
    const lang = React.useContext(LangCtx);
    const Die = ({ n }) => {
      const dots = { 1:[5], 2:[1,9], 3:[1,5,9], 4:[1,3,7,9], 5:[1,3,5,7,9], 6:[1,3,4,6,7,9] }[n];
      return (
        <div style={{
          width:72, height:72, borderRadius:12, background:'linear-gradient(135deg,#fff,#d6d6d6)',
          padding:10, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4,
          boxShadow:'0 10px 24px rgba(0,0,0,.5), inset 0 0 0 1px rgba(0,0,0,.15)',
        }}>
          {[1,2,3,4,5,6,7,8,9].map(i=>(
            <div key={i} style={{
              width:10, height:10, borderRadius:'50%',
              background: dots.includes(i) ? '#0A0710' : 'transparent',
              justifySelf:'center', alignSelf:'center',
            }}/>
          ))}
        </div>
      );
    };
    return (
      <div className="container" style={{ padding:'32px 40px 80px' }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--cyan)' }}>Table</div>
          <h1 className="h1">{lang.games.craps}</h1>
        </div>
        <div className="card-glow" style={{
          padding:40, background:'radial-gradient(ellipse at center,#0F2A3A,#05141E)',
          borderColor:'var(--cyan)', minHeight:420,
        }}>
          <div className="row gap-6 mb-8" style={{ justifyContent:'center' }}>
            <Die n={4}/><Die n={6}/>
          </div>
          <div className="text-center mb-8">
            <div className="mono" style={{ fontSize:80, fontWeight:700, color:'var(--cyan)',
                  letterSpacing:'-0.03em', textShadow:'var(--glow-cyan)', lineHeight:1 }}>10</div>
            <div className="label mt-2">Point established</div>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns:'repeat(6,1fr)' }}>
            {[['PASS','var(--green)'],["DON'T PASS",'var(--accent)'],['COME','var(--cyan)'],
              ['FIELD','var(--gold)'],['BIG 6','var(--purple)'],['ANY 7','var(--accent-bright)']].map(([l,c])=>(
              <div key={l} style={{
                padding:'14px 8px', borderRadius:6, textAlign:'center',
                background:`${c}22`, border:`1px solid ${c}66`, color:c,
                fontSize:11, fontWeight:700, letterSpacing:'.06em',
              }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Crash (interactive) ─────────────────────────────────────────────────
  function Crash({ balance, onBalanceChange }) {
    const lang = React.useContext(LangCtx);
    const [multi, setMulti] = React.useState(1.00);
    const [state, setState] = React.useState('idle'); // idle, flying, crashed, cashed
    const [bet, setBet] = React.useState(50);
    const [bustAt, setBustAt] = React.useState(null);
    const [history, setHistory] = React.useState([1.24, 3.08, 1.01, 12.4, 2.6, 1.8, 4.2]);

    React.useEffect(() => {
      if (state !== 'flying') return;
      const id = setInterval(() => {
        setMulti(m => {
          const next = +(m + 0.03 * Math.pow(m, 1.02)).toFixed(2);
          if (next >= bustAt) {
            setState('crashed');
            setHistory(h => [+bustAt.toFixed(2), ...h].slice(0, 10));
            return bustAt;
          }
          return next;
        });
      }, 80);
      return () => clearInterval(id);
    }, [state, bustAt]);

    const launch = () => {
      if (balance < bet) return;
      onBalanceChange(balance - bet);
      setMulti(1.00);
      setBustAt(1 + Math.pow(Math.random(), 2) * 15 + 0.1);
      setState('flying');
    };
    const cashout = () => {
      if (state !== 'flying') return;
      onBalanceChange(balance + Math.round(bet * multi));
      setState('cashed');
    };
    const reset = () => { setState('idle'); setMulti(1.00); };

    const color = state === 'crashed' ? 'var(--accent)'
                : state === 'cashed'  ? 'var(--green)' : 'var(--gold)';

    return (
      <div className="container" style={{ padding:'32px 40px 80px' }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--green)' }}>Realtime</div>
          <h1 className="h1">{lang.games.crash}</h1>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns:'2fr 1fr' }}>
          <div className="card-glow" style={{
            padding:0, minHeight:420,
            background:'radial-gradient(ellipse at 50% 100%, rgba(255,200,57,.15), var(--bg-1))',
            overflow:'hidden', position:'relative',
          }}>
            <svg viewBox="0 0 400 280" preserveAspectRatio="none"
                 style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
              <defs>
                <linearGradient id="crashGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity="0.4"/>
                  <stop offset="1" stopColor={color} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={`M 0 280 Q 120 ${280 - Math.min(multi, 15) * 15} 400 ${280 - Math.min(multi, 15) * 18} L 400 280 Z`}
                    fill="url(#crashGrad)"/>
              <path d={`M 0 280 Q 120 ${280 - Math.min(multi, 15) * 15} 400 ${280 - Math.min(multi, 15) * 18}`}
                    stroke={color} strokeWidth="3" fill="none"
                    style={{ filter:`drop-shadow(0 0 8px ${color})` }}/>
            </svg>
            <div style={{ position:'relative', zIndex:1, padding:'60px 40px', textAlign:'center' }}>
              <div className="mono" style={{ fontSize:96, fontWeight:800, lineHeight:1,
                    color, letterSpacing:'-0.03em',
                    textShadow:`0 0 24px ${color}` }}>
                {multi.toFixed(2)}×
              </div>
              <div className="label mt-4" style={{ color }}>
                {state === 'idle' ? 'WAITING'
                 : state === 'flying' ? 'IN FLIGHT'
                 : state === 'crashed' ? `BUST @ ${bustAt?.toFixed(2)}×`
                 : `CASHED @ ${multi.toFixed(2)}×`}
              </div>
            </div>
            <div style={{ position:'absolute', bottom:16, left:16, right:16, display:'flex', gap:6 }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  flex:1, padding:'6px 0', borderRadius:4, textAlign:'center',
                  background: h < 2 ? 'rgba(255,46,99,.2)' : 'rgba(0,230,118,.2)',
                  color: h < 2 ? 'var(--accent-bright)' : 'var(--green)',
                  fontSize:11, fontWeight:700, fontFamily:'var(--font-mono)',
                }}>{h.toFixed(2)}×</div>
              ))}
            </div>
          </div>
          <div className="card col gap-4">
            <div className="field">
              <label>{lang.common.bet}</label>
              <div className="row gap-2">
                {[10,50,100,500].map(v => (
                  <button key={v} onClick={() => setBet(v)} disabled={state==='flying'}
                          style={{
                            flex:1, padding:'10px',
                            background: bet===v ? 'linear-gradient(135deg,var(--gold),var(--gold-dim))' : 'var(--bg-2)',
                            color: bet===v ? '#1A0F00' : 'var(--fg-2)',
                            fontFamily:'var(--font-mono)', fontWeight:600, fontSize:13,
                            borderRadius:'var(--radius-md)', border:'1px solid var(--border-1)',
                          }}>${v}</button>
                ))}
              </div>
            </div>
            {state === 'idle' && (
              <button onClick={launch} disabled={balance < bet} className="btn btn-primary btn-xl btn-block">
                {lang.common.launch} · ${bet}
              </button>
            )}
            {state === 'flying' && (
              <button onClick={cashout} className="btn btn-danger btn-xl btn-block">
                Cash out ${Math.round(bet * multi)}
              </button>
            )}
            {(state === 'crashed' || state === 'cashed') && (
              <button onClick={reset} className="btn btn-secondary btn-xl btn-block">
                Again
              </button>
            )}
            <div className="mt-4" style={{ padding:'12px', background:'var(--bg-2)', borderRadius:8 }}>
              <div className="label mb-2">Potential</div>
              <div className="money" style={{ fontSize:20 }}>
                ${Math.round(bet * multi).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Hi-Lo (interactive) ─────────────────────────────────────────────────
  function HiLo({ balance, onBalanceChange }) {
    const lang = React.useContext(LangCtx);
    const [current, setCurrent] = React.useState(7);
    const [streak, setStreak] = React.useState(2);
    const [bet] = React.useState(20);
    const [anim, setAnim] = React.useState(null);
    const play = dir => {
      const next = Math.floor(Math.random()*13)+1;
      const correct = (dir==='hi' && next >= current) || (dir==='lo' && next <= current);
      setAnim(correct ? 'win' : 'lose');
      setTimeout(() => {
        setAnim(null);
        setCurrent(next);
        if (correct) { setStreak(s => s+1); onBalanceChange(balance + Math.round(bet*0.85)); }
        else { setStreak(0); onBalanceChange(balance - bet); }
      }, 600);
    };
    return (
      <div className="container" style={{ padding:'32px 40px 80px', maxWidth:680 }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--gold)' }}>Card</div>
          <h1 className="h1">{lang.games.hilo}</h1>
        </div>
        <div className="card-glow text-center" style={{ padding:48 }}>
          <div className="label mb-4">Current card</div>
          <div style={{
            margin:'0 auto', width:180, height:260, borderRadius:14,
            background:'linear-gradient(180deg,#fafafa,#d6d6d6)',
            display:'grid', placeItems:'center',
            fontFamily:'var(--font-serif)', fontSize:120, fontWeight:700,
            color: current >= 7 ? 'var(--accent)' : '#111',
            boxShadow:'0 20px 60px rgba(0,0,0,.6), inset 0 0 0 3px rgba(255,200,57,.3)',
            transform: anim ? 'scale(1.05)' : 'scale(1)',
            transition:'transform .3s var(--ease-spring)',
          }}>{current}</div>
          <div className="mt-6">
            <span className="tag tag-gold" style={{ fontSize:13, padding:'6px 14px' }}>
              Streak × {streak}
            </span>
          </div>
          <div className="row gap-4 mt-8" style={{ justifyContent:'center' }}>
            <button onClick={() => play('lo')} className="btn btn-lg"
                    style={{ background:'linear-gradient(135deg,var(--cyan),#0097B2)',
                             color:'#001014', fontWeight:700, minWidth:140 }}>
              ↓ Lower ×1.85
            </button>
            <button onClick={() => play('hi')} className="btn btn-lg"
                    style={{ background:'linear-gradient(135deg,var(--accent-bright),var(--accent))',
                             color:'#fff', fontWeight:700, minWidth:140 }}>
              ↑ Higher ×1.85
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Top-up (static) ─────────────────────────────────────────────────────
  function Topup({ onBalanceChange, balance }) {
    const lang = React.useContext(LangCtx);
    const t = { ru:'Пополнить баланс', en:'Top up balance', es:'Recargar saldo' }[lang.code];
    const sub = { ru:'Виртуальные деньги — никаких реальных платежей.',
                  en:'Virtual money only — no real payments.',
                  es:'Solo dinero virtual, sin pagos reales.' }[lang.code];
    const packs = [
      { amount:500,   price:'$0.99',  bonus:0,   tier:'common' },
      { amount:2500,  price:'$4.99',  bonus:250, tier:'rare' },
      { amount:10000, price:'$14.99', bonus:2000,tier:'epic', featured:true },
      { amount:50000, price:'$49.99', bonus:15000,tier:'legendary' },
    ];
    return (
      <div className="container" style={{ padding:'32px 40px 80px' }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--gold)' }}>{lang.common.balance}</div>
          <h1 className="h1 mb-4">{t}</h1>
          <p className="p-lg" style={{ maxWidth:540 }}>{sub}</p>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
          {packs.map((p,i) => (
            <div key={i} className="card-interactive" style={{
              padding:28, textAlign:'center', position:'relative',
              borderColor: p.featured ? 'var(--gold)' : undefined,
              boxShadow: p.featured ? 'var(--glow-gold)' : undefined,
              background: p.featured ? 'linear-gradient(135deg,rgba(255,200,57,.1),var(--bg-1))' : undefined,
            }}>
              {p.featured && <div className="tag tag-gold" style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)' }}>★ BEST</div>}
              <div style={{ fontSize:48, fontFamily:'var(--font-serif)', color:TIER_COLOR[p.tier],
                    fontStyle:'italic', lineHeight:1, marginBottom:12 }}>$</div>
              <div className="money" style={{ fontSize:28, lineHeight:1 }}>${p.amount.toLocaleString()}</div>
              {p.bonus > 0 && (
                <div className="mt-2" style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>
                  +${p.bonus.toLocaleString()} bonus
                </div>
              )}
              <div className="mt-6 mb-4" style={{ height:1, background:'var(--border-1)' }}/>
              <button className="btn btn-primary btn-block">{p.price}</button>
            </div>
          ))}
        </div>
        <div className="card mt-8" style={{ background:'var(--bg-1)' }}>
          <div className="label mb-3">Payment methods</div>
          <div className="row gap-3" style={{ flexWrap:'wrap' }}>
            {['Visa','Mastercard','Apple Pay','Google Pay','PayPal','Crypto'].map(m => (
              <div key={m} className="tag" style={{ padding:'8px 14px', fontSize:12 }}>{m}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Onboarding (static; 3 steps shown side-by-side) ─────────────────────
  function Onboarding() {
    const lang = React.useContext(LangCtx);
    const [step, setStep] = React.useState(0);
    const steps = {
      ru: [
        { t:'Добро пожаловать в Freezino', d:'Это не казино. Это симулятор, который показывает, как быстро уходят деньги.', icon:I.flame, c:'var(--gold)' },
        { t:'Только виртуальные деньги', d:'Никаких реальных ставок. Баланс не настоящий. Эмоции — настоящие.', icon:I.lock, c:'var(--cyan)' },
        { t:'Запоминайте свои цифры', d:'Играйте, проигрывайте, закрывайте. А затем удалите настоящее приложение.', icon:I.check, c:'var(--green)' },
      ],
      en: [
        { t:'Welcome to Freezino', d:"This isn't a casino. It's a simulator that shows how fast money vanishes.", icon:I.flame, c:'var(--gold)' },
        { t:'Virtual money only', d:'No real wagers. The balance is fake. The feeling is not.', icon:I.lock, c:'var(--cyan)' },
        { t:'Remember your numbers', d:'Play, lose, close the app. Then delete the real one.', icon:I.check, c:'var(--green)' },
      ],
      es: [
        { t:'Bienvenido a Freezino', d:'No es un casino. Es un simulador que muestra qué rápido se va el dinero.', icon:I.flame, c:'var(--gold)' },
        { t:'Solo dinero virtual', d:'Sin apuestas reales. El saldo es falso. La sensación, no.', icon:I.lock, c:'var(--cyan)' },
        { t:'Recuerda tus números', d:'Juega, pierde, cierra. Luego borra la app real.', icon:I.check, c:'var(--green)' },
      ],
    }[lang.code];
    const s = steps[step];
    return (
      <div className="container" style={{ padding:'60px 40px', maxWidth:560, textAlign:'center' }}>
        <div style={{
          width:96, height:96, margin:'0 auto 32px', borderRadius:'50%',
          background:`linear-gradient(135deg, ${s.c}, ${s.c}55)`,
          display:'grid', placeItems:'center',
          boxShadow:`0 0 48px ${s.c}88`,
        }}>{React.cloneElement(s.icon, { size: 44 })}</div>
        <div className="h-display mb-4" style={{ fontSize:48 }}>{s.t}</div>
        <p className="p-lg mb-8">{s.d}</p>
        <div className="row gap-2 mb-8" style={{ justifyContent:'center' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: step===i ? 32 : 8, height:8, borderRadius:4,
              background: step===i ? 'var(--gold)' : 'var(--bg-3)',
              transition:'all .2s var(--ease)',
              boxShadow: step===i ? 'var(--glow-gold)' : 'none',
            }}/>
          ))}
        </div>
        <div className="row gap-3" style={{ justifyContent:'center' }}>
          {step > 0 && (
            <button onClick={() => setStep(step-1)} className="btn btn-secondary btn-lg">
              ← {lang.common.back}
            </button>
          )}
          <button onClick={() => setStep(Math.min(2, step+1))}
                  className="btn btn-primary btn-lg">
            {step < 2 ? 'Next →' : "Let's go →"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Inbox ───────────────────────────────────────────────────────────────
  function Inbox() {
    const lang = React.useContext(LangCtx);
    const t = { ru:'Уведомления', en:'Inbox', es:'Bandeja' }[lang.code];
    const msgs = {
      ru: [
        { t:'Джекпот вырос до $847 219', d:'2 минуты назад', icon:I.trophy, c:'var(--gold)', new:true },
        { t:'Вы проиграли $500 на слотах', d:'1 час назад', icon:I.trendDown, c:'var(--accent)', new:true },
        { t:'Новое достижение: 3 часа игры', d:'вчера', icon:I.clock, c:'var(--cyan)' },
        { t:'Срок кредита истекает через 3 дня', d:'2 дня назад', icon:I.credit, c:'var(--accent-bright)' },
        { t:'Смена в работе завершена', d:'3 дня назад', icon:I.briefcase, c:'var(--green)' },
      ],
      en: [
        { t:'Jackpot just grew to $847,219', d:'2 min ago', icon:I.trophy, c:'var(--gold)', new:true },
        { t:'You lost $500 on slots', d:'1h ago', icon:I.trendDown, c:'var(--accent)', new:true },
        { t:'Achievement: 3 hours played', d:'yesterday', icon:I.clock, c:'var(--cyan)' },
        { t:'Loan due in 3 days', d:'2d ago', icon:I.credit, c:'var(--accent-bright)' },
        { t:'Work shift completed', d:'3d ago', icon:I.briefcase, c:'var(--green)' },
      ],
      es: [
        { t:'El bote ha crecido a $847,219', d:'hace 2 min', icon:I.trophy, c:'var(--gold)', new:true },
        { t:'Perdiste $500 en tragaperras', d:'hace 1h', icon:I.trendDown, c:'var(--accent)', new:true },
        { t:'Logro: 3 horas jugadas', d:'ayer', icon:I.clock, c:'var(--cyan)' },
        { t:'Préstamo vence en 3 días', d:'hace 2d', icon:I.credit, c:'var(--accent-bright)' },
        { t:'Turno completado', d:'hace 3d', icon:I.briefcase, c:'var(--green)' },
      ],
    }[lang.code];
    return (
      <div className="container" style={{ padding:'32px 40px 80px', maxWidth:760 }}>
        <div className="row between mb-8">
          <div>
            <div className="label mb-2" style={{ color:'var(--cyan)' }}>Messages</div>
            <h1 className="h1">{t}</h1>
          </div>
          <span className="tag tag-accent">2 new</span>
        </div>
        <div className="col gap-2">
          {msgs.map((m, i) => (
            <div key={i} className="card-interactive" style={{
              padding:16, display:'flex', alignItems:'center', gap:16,
              background: m.new ? 'linear-gradient(90deg,rgba(255,200,57,.06),var(--bg-1))' : 'var(--bg-1)',
            }}>
              <div style={{ width:44, height:44, borderRadius:'var(--radius-md)',
                    background:`${m.c}22`, color:m.c,
                    display:'grid', placeItems:'center', flexShrink:0 }}>
                {m.icon}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--fg-1)',
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.t}</div>
                <div className="p-sm" style={{ fontSize:12, marginTop:2 }}>{m.d}</div>
              </div>
              {m.new && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--gold)',
                    boxShadow:'var(--glow-gold)', flexShrink:0 }}/>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Daily Bonus / Wheel ─────────────────────────────────────────────────
  function DailyBonus() {
    const lang = React.useContext(LangCtx);
    const t = { ru:'Ежедневный бонус', en:'Daily bonus', es:'Bono diario' }[lang.code];
    const sub = { ru:'Крутите колесо раз в 24 часа.', en:'Spin the wheel once every 24 hours.', es:'Gira la ruleta cada 24 horas.' }[lang.code];
    const segments = [
      { v:'$50',  c:'var(--gold)' },{ v:'$10', c:'var(--fg-3)' },
      { v:'$500', c:'var(--accent)' },{ v:'$100', c:'var(--cyan)' },
      { v:'$1K', c:'var(--purple)' },{ v:'$25', c:'var(--green)' },
      { v:'JACKPOT', c:'var(--gold-bright)' },{ v:'$200', c:'var(--accent-bright)' },
    ];
    const [rot, setRot] = React.useState(0);
    const spin = () => setRot(r => r + 360*5 + Math.floor(Math.random()*360));
    const seg = 360 / segments.length;
    return (
      <div className="container" style={{ padding:'32px 40px 80px', textAlign:'center', maxWidth:640 }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--gold)' }}>Daily</div>
          <h1 className="h1 mb-2">{t}</h1>
          <p className="p">{sub}</p>
        </div>
        <div style={{ position:'relative', width:320, height:320, margin:'0 auto' }}>
          <div style={{
            position:'absolute', inset:0, borderRadius:'50%',
            transform:`rotate(${rot}deg)`, transition:'transform 4s cubic-bezier(.17,.67,.22,1)',
            boxShadow:'var(--glow-gold), 0 0 0 6px var(--gold-dim)',
          }}>
            <svg viewBox="-100 -100 200 200" style={{ width:'100%', height:'100%' }}>
              {segments.map((s, i) => {
                const a1 = (i*seg-90) * Math.PI/180;
                const a2 = ((i+1)*seg-90) * Math.PI/180;
                const x1 = 100*Math.cos(a1), y1 = 100*Math.sin(a1);
                const x2 = 100*Math.cos(a2), y2 = 100*Math.sin(a2);
                const mid = ((i+0.5)*seg-90) * Math.PI/180;
                const tx = 60*Math.cos(mid), ty = 60*Math.sin(mid);
                return (
                  <g key={i}>
                    <path d={`M 0 0 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                          fill={s.c} stroke="rgba(0,0,0,.3)" strokeWidth="1"/>
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                          transform={`rotate(${(i+0.5)*seg} ${tx} ${ty})`}
                          fontFamily="var(--font-mono)" fontSize="12" fontWeight="700"
                          fill={s.c === 'var(--gold-bright)' || s.c === 'var(--gold)' ? '#1A0F00' : '#fff'}>
                      {s.v}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div style={{
            position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            width:72, height:72, borderRadius:'50%',
            background:'linear-gradient(135deg,var(--gold),var(--gold-dim))',
            display:'grid', placeItems:'center',
            fontFamily:'var(--font-serif)', fontSize:36, fontStyle:'italic', color:'#1A0F00',
            boxShadow:'0 4px 24px rgba(0,0,0,.5)',
          }}>F</div>
          <div style={{
            position:'absolute', top:-4, left:'50%', transform:'translateX(-50%)',
            width:0, height:0, borderLeft:'14px solid transparent', borderRight:'14px solid transparent',
            borderTop:'24px solid var(--accent)',
            filter:'drop-shadow(0 0 12px var(--accent))',
          }}/>
        </div>
        <button onClick={spin} className="btn btn-primary btn-xl mt-8">
          SPIN ·  +free
        </button>
      </div>
    );
  }

  // ─── Transaction History ─────────────────────────────────────────────────
  function History() {
    const lang = React.useContext(LangCtx);
    const t = { ru:'История транзакций', en:'Transaction history', es:'Historial de transacciones' }[lang.code];
    const L = { ru:['Рулетка','Слоты','Кредит','Работа','Магазин','Блэкджек'],
                en:['Roulette','Slots','Loan','Work','Shop','Blackjack'],
                es:['Ruleta','Tragaperras','Préstamo','Trabajo','Tienda','Blackjack'] }[lang.code];
    const tx = [
      { t:L[0], a:-250, d:'2 min ago' }, { t:L[1], a:+420, d:'8 min ago' },
      { t:L[1], a:-50,  d:'9 min ago' }, { t:L[3], a:+500, d:'25 min ago' },
      { t:L[2], a:+2500, d:'1h ago', c:'var(--accent)' },
      { t:L[0], a:-500, d:'1h ago' }, { t:L[5], a:-200, d:'2h ago' },
      { t:L[4], a:-8400, d:'yesterday', c:'var(--purple)' },
    ];
    return (
      <div className="container" style={{ padding:'32px 40px 80px', maxWidth:820 }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--fg-3)' }}>Ledger</div>
          <h1 className="h1">{t}</h1>
        </div>
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {tx.map((r, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1fr', padding:'16px 20px', gap:12,
              borderBottom: i < tx.length-1 ? '1px solid var(--border-1)' : undefined,
              alignItems:'center',
            }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--fg-1)' }}>{r.t}</div>
                <div className="p-sm" style={{ fontSize:12, marginTop:2 }}>{r.d}</div>
              </div>
              <div className="tag" style={{ justifySelf:'start', fontSize:10,
                    background: (r.c || (r.a > 0 ? 'var(--green-soft)' : 'var(--accent-soft)')),
                    color: (r.c ? '#fff' : (r.a > 0 ? 'var(--green)' : 'var(--accent-bright)')),
                    borderColor:'transparent' }}>
                {r.a > 0 ? 'IN' : 'OUT'}
              </div>
              <div className="mono" style={{ textAlign:'right', fontSize:15, fontWeight:700,
                    color: r.a > 0 ? 'var(--green)' : 'var(--accent-bright)' }}>
                {r.a > 0 ? '+' : '−'}${Math.abs(r.a).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Big Win Modal ───────────────────────────────────────────────────────
  function WinModal() {
    const lang = React.useContext(LangCtx);
    const t = { ru:'КРУПНЫЙ ВЫИГРЫШ!', en:'BIG WIN!', es:'¡GRAN GANANCIA!' }[lang.code];
    return (
      <div style={{
        minHeight:'calc(100vh - 64px)', display:'grid', placeItems:'center', padding:24,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0,
              background:'radial-gradient(circle at center, rgba(255,200,57,.3), transparent 60%)',
              pointerEvents:'none' }}/>
        <div className="card-glow" style={{
          padding:56, textAlign:'center', maxWidth:520,
          background:'linear-gradient(180deg, rgba(255,200,57,.1), var(--bg-1))',
          border:'2px solid var(--gold)', boxShadow:'var(--glow-gold), 0 40px 80px rgba(0,0,0,.6)',
        }}>
          <div style={{
            width:96, height:96, margin:'0 auto 20px', borderRadius:'50%',
            background:'linear-gradient(135deg,var(--gold-bright),var(--gold))',
            display:'grid', placeItems:'center', color:'#1A0F00',
            boxShadow:'var(--glow-gold)',
          }}>{React.cloneElement(I.trophy, { size: 48 })}</div>
          <div className="label mb-3 shimmer">{t}</div>
          <div className="mono shimmer" style={{
            fontSize:88, fontWeight:800, lineHeight:1, letterSpacing:'-0.03em',
          }}>+$12,400</div>
          <div className="p mt-3" style={{ color:'var(--fg-3)' }}>
            {lang.games.slots} · 5 of a kind · ×50
          </div>
          <div className="row gap-3 mt-8" style={{ justifyContent:'center' }}>
            <button className="btn btn-secondary btn-lg">Collect</button>
            <button className="btn btn-primary btn-lg">Double or nothing →</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Lose Screen (balance 0) ─────────────────────────────────────────────
  function LoseScreen() {
    const lang = React.useContext(LangCtx);
    const t = { ru:'Баланс пуст', en:'Balance empty', es:'Saldo vacío' }[lang.code];
    const sub = {
      ru:'И заметьте — это было виртуально. Представьте, если бы это были настоящие деньги.',
      en:"And remember — this was fake money. Now imagine it wasn't.",
      es:'Y recuerda: era dinero falso. Imagínalo con dinero real.',
    }[lang.code];
    return (
      <div style={{
        minHeight:'calc(100vh - 64px)', display:'grid', placeItems:'center', padding:24,
      }}>
        <div style={{ textAlign:'center', maxWidth:560 }}>
          <div style={{
            width:112, height:112, margin:'0 auto 32px', borderRadius:'50%',
            background:'linear-gradient(135deg,var(--accent),var(--purple))',
            display:'grid', placeItems:'center',
            boxShadow:'var(--glow-accent)',
          }}>{React.cloneElement(I.trendDown, { size: 56 })}</div>
          <div className="h-display mb-4" style={{ fontSize:56, color:'var(--accent-bright)' }}>{t}</div>
          <div className="mono mb-6" style={{ fontSize:72, fontWeight:800, color:'var(--fg-1)',
                letterSpacing:'-0.03em', lineHeight:1 }}>$0.00</div>
          <p className="p-lg mb-8">{sub}</p>
          <div className="row gap-3" style={{ justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-danger btn-lg">{lang.credit.take}</button>
            <button className="btn btn-primary btn-lg">{lang.work.claim} · $500</button>
            <button className="btn btn-secondary btn-lg">{lang.common.balance} +$500</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Settings ────────────────────────────────────────────────────────────
  function Settings({ lang, onLangChange }) {
    const t = { ru:'Настройки', en:'Settings', es:'Ajustes' }[lang.code];
    const [sound, setSound] = React.useState(true);
    const [music, setMusic] = React.useState(true);
    const [notif, setNotif] = React.useState(false);
    const [haptic, setHaptic] = React.useState(true);
    const Toggle = ({ on, onClick }) => (
      <button onClick={onClick} style={{
        width:44, height:26, borderRadius:13, padding:2,
        background: on ? 'var(--green)' : 'var(--bg-3)',
        boxShadow: on ? 'var(--glow-green)' : 'none',
        transition:'background .2s',
      }}>
        <div style={{
          width:22, height:22, borderRadius:'50%', background:'#fff',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition:'transform .2s var(--ease-spring)',
        }}/>
      </button>
    );
    const Row = ({ icon, label, value, right }) => (
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px',
            borderBottom:'1px solid var(--border-1)' }}>
        <span style={{ color:'var(--fg-3)' }}>{icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--fg-1)' }}>{label}</div>
          {value && <div className="p-sm" style={{ fontSize:12 }}>{value}</div>}
        </div>
        {right}
      </div>
    );
    return (
      <div className="container" style={{ padding:'32px 40px 80px', maxWidth:720 }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--fg-3)' }}>Preferences</div>
          <h1 className="h1">{t}</h1>
        </div>
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <Row icon={I.volume} label={lang.code==='ru'?'Звуковые эффекты':lang.code==='es'?'Efectos de sonido':'Sound effects'}
               right={<Toggle on={sound} onClick={()=>setSound(!sound)}/>}/>
          <Row icon={I.volume} label={lang.code==='ru'?'Музыка':lang.code==='es'?'Música':'Music'}
               right={<Toggle on={music} onClick={()=>setMusic(!music)}/>}/>
          <Row icon={I.bell} label={lang.code==='ru'?'Уведомления':lang.code==='es'?'Notificaciones':'Push notifications'}
               right={<Toggle on={notif} onClick={()=>setNotif(!notif)}/>}/>
          <Row icon={I.zap} label={lang.code==='ru'?'Вибрация':lang.code==='es'?'Vibración':'Haptic feedback'}
               right={<Toggle on={haptic} onClick={()=>setHaptic(!haptic)}/>}/>
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px' }}>
            <span style={{ color:'var(--fg-3)' }}>{I.globe}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--fg-1)' }}>
                {lang.code==='ru'?'Язык':lang.code==='es'?'Idioma':'Language'}
              </div>
              <div className="p-sm" style={{ fontSize:12 }}>{lang.label}</div>
            </div>
            <div className="row gap-2">
              {Object.values(window.TRANSLATIONS).map(l => (
                <button key={l.code} onClick={() => onLangChange(l)}
                        style={{
                          padding:'6px 10px', borderRadius:6, fontSize:12, fontWeight:600,
                          background: lang.code===l.code ? 'var(--gold)' : 'var(--bg-2)',
                          color: lang.code===l.code ? '#1A0F00' : 'var(--fg-2)',
                          border:'1px solid var(--border-1)',
                        }}>{l.flag} {l.code.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="card mt-4" style={{ padding:0, overflow:'hidden' }}>
          {[
            { l: lang.code==='ru'?'Аккаунт':lang.code==='es'?'Cuenta':'Account', v:'igrok_1985' },
            { l:'Email', v:'player@example.com' },
            { l: lang.code==='ru'?'Выйти':lang.code==='es'?'Cerrar sesión':'Log out', v:'', danger:true },
          ].map((r, i, a) => (
            <div key={i} style={{ padding:'18px 20px', borderBottom: i<a.length-1 ? '1px solid var(--border-1)' : undefined,
                  display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500,
                      color: r.danger ? 'var(--accent-bright)' : 'var(--fg-1)' }}>{r.l}</div>
                {r.v && <div className="p-sm" style={{ fontSize:12 }}>{r.v}</div>}
              </div>
              {!r.danger && <span style={{ color:'var(--fg-4)' }}>{I.arrowR}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Leaderboard ─────────────────────────────────────────────────────────
  function Leaderboard() {
    const lang = React.useContext(LangCtx);
    const t = { ru:'Лидерборд', en:'Leaderboard', es:'Clasificación' }[lang.code];
    const sub = { ru:'Кто проиграл больше всех за неделю.',
                  en:'Who lost the most this week.',
                  es:'Quién perdió más esta semana.' }[lang.code];
    const rows = [
      { r:1, n:'whale_88',     lost:84210, time:'62h' },
      { r:2, n:'lucky_loser',  lost:52300, time:'48h' },
      { r:3, n:'casino_ghost', lost:41080, time:'33h' },
      { r:4, n:'roulette_rita',lost:22100, time:'19h', you:false },
      { r:5, n:'spin2win',     lost:18400, time:'14h' },
      { r:6, n:'igrok_1985',   lost:2840,  time:'2h 47m', you:true },
      { r:7, n:'high_roller',  lost:1920,  time:'4h' },
    ];
    const rankColor = r => r===1 ? 'var(--gold)' : r===2 ? '#C0C0C0' : r===3 ? '#CD7F32' : 'var(--fg-3)';
    return (
      <div className="container" style={{ padding:'32px 40px 80px', maxWidth:820 }}>
        <div className="mb-8">
          <div className="label mb-2" style={{ color:'var(--accent)' }}>Weekly</div>
          <h1 className="h1 mb-4">{t}</h1>
          <p className="p-lg" style={{ maxWidth:540 }}>{sub}</p>
        </div>

        {/* Top 3 podium */}
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns:'1fr 1.2fr 1fr', alignItems:'flex-end' }}>
          {[rows[1], rows[0], rows[2]].map((p, i) => {
            const h = [140, 180, 120][i];
            const c = rankColor(p.r);
            return (
              <div key={p.r} className="card" style={{
                textAlign:'center', padding:'20px 12px', height:h,
                background:`linear-gradient(180deg, ${c}22, var(--bg-1))`,
                borderColor:`${c}55`,
                display:'flex', flexDirection:'column', justifyContent:'flex-end',
              }}>
                <div className="mono" style={{ fontSize:36, fontWeight:800, color:c, lineHeight:1 }}>
                  #{p.r}
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--fg-1)', marginTop:6 }}>{p.n}</div>
                <div className="money" style={{ fontSize:14, color:'var(--accent-bright)', marginTop:4 }}>
                  −${p.lost.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {rows.slice(3).map((r, i) => (
            <div key={r.n} style={{
              display:'grid', gridTemplateColumns:'40px 1fr auto auto', gap:14,
              padding:'16px 20px', alignItems:'center',
              background: r.you ? 'linear-gradient(90deg,rgba(255,200,57,.1),transparent)' : undefined,
              borderBottom: i < rows.length-4 ? '1px solid var(--border-1)' : undefined,
            }}>
              <div className="mono" style={{ fontSize:15, fontWeight:700, color:rankColor(r.r) }}>#{r.r}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600,
                      color: r.you ? 'var(--gold)' : 'var(--fg-1)' }}>
                  {r.n}{r.you && <span className="tag tag-gold" style={{ marginLeft:8, fontSize:10 }}>YOU</span>}
                </div>
                <div className="p-sm" style={{ fontSize:12 }}>{r.time}</div>
              </div>
              <div className="money" style={{ color:'var(--accent-bright)', fontSize:15 }}>
                −${r.lost.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  window.ExtraScreens = {
    Blackjack, Craps, Crash, HiLo, Topup, Onboarding,
    Inbox, DailyBonus, History, WinModal, LoseScreen,
    Settings, Leaderboard,
  };
})();
