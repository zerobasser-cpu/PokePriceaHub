exports.id=548,exports.ids=[548],exports.modules={453:()=>{},1135:()=>{},1472:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>f,metadata:()=>e});var d=c(5338);c(1135);let e={title:{default:"PokePrices — Pok\xe9mon Card Prices",template:"%s | PokePrices"},description:"Search Pok\xe9mon cards, sets, rarities and types. Compare Pok\xe9mon card prices from multiple sources.",keywords:["Pokemon card prices","Pokemon cards","Pokemon TCG","Pokemon card value","TCG prices","Cardmarket","TCGplayer"]};function f({children:a}){return(0,d.jsx)("html",{lang:"en",children:(0,d.jsx)("body",{children:a})})}},2309:()=>{},3487:(a,b,c)=>{"use strict";c.d(b,{Fs:()=>u,H0:()=>B,PK:()=>r,SQ:()=>z,Sv:()=>w,TZ:()=>A,Th:()=>q,VF:()=>s,hE:()=>y,ih:()=>t,kR:()=>x,pF:()=>v});var d=c(7550),e=c.n(d),f=c(9902),g=c.n(f),h=c(9021),i=c.n(h);let j=process.cwd(),k=process.env.POKEPRICES_DATABASE_PATH||g().join(j,"data","pokemon.db"),l=null;function m(){if(l)return l;if(!i().existsSync(k))throw Error(`Pok\xe9mon database not found at:
${k}

Run "npm.cmd run import-data" first.`);return(l=new(e())(k)).pragma("journal_mode = WAL"),l.pragma("foreign_keys = ON"),l.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      card_id TEXT NOT NULL,

      snapshot_date TEXT NOT NULL,

      tcgplayer REAL,
      cardmarket REAL,
      ebay REAL,
      average REAL,

      created_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (
        card_id,
        snapshot_date
      ),

      FOREIGN KEY(card_id)
        REFERENCES cards(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS
      idx_price_history_card_date
    ON price_history (
      card_id,
      snapshot_date DESC
    );

    CREATE INDEX IF NOT EXISTS
      idx_price_history_date
    ON price_history (
      snapshot_date DESC
    );

    CREATE INDEX IF NOT EXISTS
      idx_price_history_average
    ON price_history (
      card_id,
      average,
      snapshot_date DESC
    );
  `),l}function n(a,b){if(null==a||""===a)return b;if("string"!=typeof a)return a;try{return JSON.parse(a)}catch{return b}}function o(a){return{id:a.id,name:a.name,series:a.series||void 0,printedTotal:null!==a.printed_total&&void 0!==a.printed_total?Number(a.printed_total):void 0,total:null!==a.total&&void 0!==a.total?Number(a.total):void 0,releaseDate:a.release_date||void 0,updatedAt:a.updated_at||void 0,images:{symbol:a.symbol_image||void 0,logo:a.logo_image||void 0}}}function p(a){let b=n(a.types,[]);return{id:a.id,name:a.name,supertype:a.supertype||void 0,subtypes:n(a.subtypes,[]),level:a.level||void 0,hp:a.hp||void 0,types:b,evolvesFrom:a.evolves_from||void 0,evolvesTo:n(a.evolves_to,[]),rules:n(a.rules,[]),attacks:n(a.attacks,[]),weaknesses:n(a.weaknesses,[]),resistances:n(a.resistances,[]),retreatCost:n(a.retreat_cost,[]),convertedRetreatCost:null!==a.converted_retreat_cost&&void 0!==a.converted_retreat_cost?Number(a.converted_retreat_cost):void 0,number:a.number||void 0,artist:a.artist||void 0,rarity:a.rarity||void 0,flavorText:a.flavor_text||void 0,nationalPokedexNumbers:n(a.national_pokedex_numbers,[]),legalities:n(a.legalities,{}),regulationMark:a.regulation_mark||void 0,images:{small:a.image_small||void 0,large:a.image_large||void 0},image_small:a.image_small||void 0,image_large:a.image_large||void 0,imageSmall:a.image_small||void 0,imageLarge:a.image_large||void 0,tcgplayer:n(a.tcgplayer,void 0),cardmarket:n(a.cardmarket,void 0),set:{id:a.set_id||void 0,name:a.set_name||void 0,series:a.set_series||void 0,printedTotal:null!==a.set_printed_total&&void 0!==a.set_printed_total?Number(a.set_printed_total):void 0,total:null!==a.set_total&&void 0!==a.set_total?Number(a.set_total):void 0,releaseDate:a.set_release_date||void 0,updatedAt:a.set_updated_at||void 0,images:{symbol:a.set_symbol_image||void 0,logo:a.set_logo_image||void 0}}}}function q(a){let b=m().prepare(`
        SELECT
          c.*,

          s.name AS set_name,
          s.series AS set_series,
          s.printed_total AS set_printed_total,
          s.total AS set_total,
          s.release_date AS set_release_date,
          s.updated_at AS set_updated_at,
          s.symbol_image AS set_symbol_image,
          s.logo_image AS set_logo_image

        FROM cards c

        LEFT JOIN sets s
          ON s.id = c.set_id

        WHERE c.id = ?

        LIMIT 1
        `).get(a);return b?p(b):null}function r(a={}){let b=m(),c=a.search?.trim()||"",d=a.setId?.trim()||"",e=a.rarity?.trim()||"",f=a.type?.trim()||"",g=a.supertype?.trim()||"",h=Math.max(1,Number(a.page)||1),i=Math.min(100,Math.max(1,Number(a.pageSize)||24)),j=[],k={};c&&(j.push(`(c.name LIKE @search
        OR c.id LIKE @search
        OR c.number LIKE @search)`),k.search=`%${c}%`),d&&(j.push("c.set_id = @setId"),k.setId=d),e&&(j.push("c.rarity = @rarity"),k.rarity=e),g&&(j.push("c.supertype = @supertype"),k.supertype=g),f&&(j.push(`
      EXISTS (
        SELECT 1
        FROM card_types ct
        WHERE ct.card_id = c.id
          AND ct.type = @type
      )
    `),k.type=f);let l=j.length>0?`WHERE ${j.join(" AND ")}`:"",n=b.prepare(`
        SELECT COUNT(*) AS count

        FROM cards c

        ${l}
        `).get(k),o=Number(n?.count||0),q=0===o?0:Math.ceil(o/i),s=q>0?Math.min(h,q):1;return{cards:b.prepare(`
        SELECT
          c.*,

          s.name AS set_name,
          s.series AS set_series,
          s.printed_total AS set_printed_total,
          s.total AS set_total,
          s.release_date AS set_release_date,
          s.updated_at AS set_updated_at,
          s.symbol_image AS set_symbol_image,
          s.logo_image AS set_logo_image

        FROM cards c

        LEFT JOIN sets s
          ON s.id = c.set_id

        ${l}

        ORDER BY
          s.release_date DESC,
          c.set_id ASC,
          c.number ASC,
          c.name ASC

        LIMIT @limit

        OFFSET @offset
        `).all({...k,limit:i,offset:(s-1)*i}).map(p),total:o,page:s,pageSize:i,totalPages:q}}function s(){return m().prepare(`
        SELECT
          id,
          name,
          series,
          printed_total,
          total,
          release_date,
          updated_at,
          symbol_image,
          logo_image

        FROM sets

        ORDER BY
          release_date DESC,
          name ASC
        `).all().map(o)}function t(a){let b=m().prepare(`
        SELECT
          id,
          name,
          series,
          printed_total,
          total,
          release_date,
          updated_at,
          symbol_image,
          logo_image

        FROM sets

        WHERE id = ?

        LIMIT 1
        `).get(a);return b?o(b):null}function u(){return m().prepare(`
        SELECT DISTINCT rarity

        FROM cards

        WHERE rarity IS NOT NULL
          AND rarity != ''

        ORDER BY rarity ASC
        `).all().map(a=>a.rarity)}function v(){return m().prepare(`
        SELECT DISTINCT type

        FROM card_types

        WHERE type IS NOT NULL
          AND type != ''

        ORDER BY type ASC
        `).all().map(a=>a.type)}function w(){return m().prepare(`
        SELECT DISTINCT supertype

        FROM cards

        WHERE supertype IS NOT NULL
          AND supertype != ''

        ORDER BY supertype ASC
        `).all().map(a=>a.supertype)}function x(a=10){let b=m(),c=Math.max(1,Math.min(Math.floor(a)||10,50)),d=b.prepare(`
        SELECT
          rarity,
          COUNT(*) AS cnt

        FROM cards

        WHERE rarity IS NOT NULL
          AND rarity != ''

        GROUP BY rarity

        ORDER BY
          cnt ASC,
          rarity ASC

        LIMIT @limit
        `).all({limit:c}),e=[];for(let{rarity:a}of d){let c=b.prepare(`
          SELECT
            c.*,

            s.name AS set_name,
            s.series AS set_series,
            s.printed_total AS set_printed_total,
            s.total AS set_total,
            s.release_date AS set_release_date,
            s.updated_at AS set_updated_at,
            s.symbol_image AS set_symbol_image,
            s.logo_image AS set_logo_image

          FROM cards c

          LEFT JOIN sets s
            ON s.id = c.set_id

          WHERE c.rarity = @rarity

            AND c.image_large IS NOT NULL
            AND c.image_large != ''

          ORDER BY
            s.release_date DESC,
            c.name ASC

          LIMIT 1
          `).get({rarity:a});c&&e.push(p(c))}return e.slice(0,c)}function y(a,b){let c=m(),d=new Date().toISOString().slice(0,10),e="number"==typeof b.tcgplayer&&Number.isFinite(b.tcgplayer)?b.tcgplayer:null,f="number"==typeof b.cardmarket&&Number.isFinite(b.cardmarket)?b.cardmarket:null,g="number"==typeof b.ebay&&Number.isFinite(b.ebay)?b.ebay:null,h="number"==typeof b.average&&Number.isFinite(b.average)?b.average:null;(null!==e||null!==f||null!==g||null!==h)&&c.prepare(`
    INSERT INTO price_history (
      card_id,
      snapshot_date,
      tcgplayer,
      cardmarket,
      ebay,
      average,
      updated_at
    )

    VALUES (
      @cardId,
      @snapshotDate,
      @tcgplayer,
      @cardmarket,
      @ebay,
      @average,
      CURRENT_TIMESTAMP
    )

    ON CONFLICT (
      card_id,
      snapshot_date
    )

    DO UPDATE SET

      tcgplayer =
        excluded.tcgplayer,

      cardmarket =
        excluded.cardmarket,

      ebay =
        excluded.ebay,

      average =
        excluded.average,

      updated_at =
        CURRENT_TIMESTAMP
    `).run({cardId:a,snapshotDate:d,tcgplayer:e,cardmarket:f,ebay:g,average:h})}function z(a,b=3650){let c=m(),d=Math.max(1,Math.min(Math.floor(b)||3650,1e4));return c.prepare(`
        SELECT
          card_id,
          snapshot_date,
          tcgplayer,
          cardmarket,
          ebay,
          average

        FROM price_history

        WHERE card_id = ?

        ORDER BY
          snapshot_date DESC

        LIMIT ?
        `).all(a,d).reverse().map(a=>({cardId:a.card_id,snapshotDate:a.snapshot_date,tcgplayer:null!==a.tcgplayer?Number(a.tcgplayer):null,cardmarket:null!==a.cardmarket?Number(a.cardmarket):null,ebay:null!==a.ebay?Number(a.ebay):null,average:null!==a.average?Number(a.average):null}))}function A(a,b){let c=function(a){let b=m().prepare(`
        SELECT
          card_id,
          snapshot_date,
          tcgplayer,
          cardmarket,
          ebay,
          average

        FROM price_history

        WHERE card_id = ?

        ORDER BY
          snapshot_date DESC

        LIMIT 1
        `).get(a);return b?{cardId:b.card_id,snapshotDate:b.snapshot_date,tcgplayer:null!==b.tcgplayer?Number(b.tcgplayer):null,cardmarket:null!==b.cardmarket?Number(b.cardmarket):null,ebay:null!==b.ebay?Number(b.ebay):null,average:null!==b.average?Number(b.average):null}:null}(a);if(!c||null===c.average)return{current:null,previous:null,change:null,percentage:null,currentDate:null,previousDate:null,hasHistory:!1};let d=Math.max(1,Math.floor(Number(b)||1)),e=function(a,b){let c=m().prepare(`
        SELECT
          card_id,
          snapshot_date,
          tcgplayer,
          cardmarket,
          ebay,
          average

        FROM price_history

        WHERE card_id = ?

          AND snapshot_date <= ?

        ORDER BY
          snapshot_date DESC

        LIMIT 1
        `).get(a,b);return c?{cardId:c.card_id,snapshotDate:c.snapshot_date,tcgplayer:null!==c.tcgplayer?Number(c.tcgplayer):null,cardmarket:null!==c.cardmarket?Number(c.cardmarket):null,ebay:null!==c.ebay?Number(c.ebay):null,average:null!==c.average?Number(c.average):null}:null}(a,(()=>{let a=new Date(`${c.snapshotDate}T00:00:00Z`);return a.setUTCDate(a.getUTCDate()-d),a.toISOString().slice(0,10)})());if(!e||null===e.average)return{current:c.average,previous:null,change:null,percentage:null,currentDate:c.snapshotDate,previousDate:null,hasHistory:!1};let f=c.average-e.average,g=0!==e.average?f/e.average*100:null;return{current:c.average,previous:e.average,change:Math.round(100*f)/100,percentage:null!==g?Math.round(100*g)/100:null,currentDate:c.snapshotDate,previousDate:e.snapshotDate,hasHistory:!0}}function B(a,b=5){let c=m(),d=Math.max(1,Math.min(Math.floor(Number(a)||1),3650)),e=Math.max(1,Math.min(Math.floor(Number(b)||5),25)),f=`-${d} days`,g=c.prepare(`
        SELECT

          current_prices.card_id,

          current_prices.current_date,

          current_prices.current_average,

          previous_prices.previous_date,

          previous_prices.previous_average,

          c.*,

          s.name AS set_name,

          s.series AS set_series,

          s.printed_total AS set_printed_total,

          s.total AS set_total,

          s.release_date AS set_release_date,

          s.updated_at AS set_updated_at,

          s.symbol_image AS set_symbol_image,

          s.logo_image AS set_logo_image

        FROM (

          /*
          --------------------------------------------------
          LATEST VALID PRICE FOR EACH CARD
          --------------------------------------------------
          */

          SELECT
            ph.card_id,

            ph.snapshot_date
              AS current_date,

            ph.average
              AS current_average

          FROM price_history ph

          INNER JOIN (

            SELECT
              card_id,

              MAX(snapshot_date)
                AS latest_date

            FROM price_history

            WHERE average IS NOT NULL

              AND average > 0

            GROUP BY
              card_id

          ) latest

            ON latest.card_id =
               ph.card_id

           AND latest.latest_date =
               ph.snapshot_date

          WHERE ph.average IS NOT NULL

            AND ph.average > 0

        ) current_prices

        INNER JOIN (

          /*
          --------------------------------------------------
          HISTORICAL PRICE FOR EACH CARD
          --------------------------------------------------

          The correlated subquery calculates the cutoff
          using the card's own current snapshot date.
          --------------------------------------------------
          */

          SELECT

            current_ref.card_id,

            current_ref.snapshot_date
              AS current_date,

            previous.snapshot_date
              AS previous_date,

            previous.average
              AS previous_average

          FROM price_history previous

          INNER JOIN (

            SELECT
              ph.card_id,

              ph.snapshot_date,

              ph.average

            FROM price_history ph

            INNER JOIN (

              SELECT
                card_id,

                MAX(snapshot_date)
                  AS latest_date

              FROM price_history

              WHERE average IS NOT NULL

                AND average > 0

              GROUP BY
                card_id

            ) latest

              ON latest.card_id =
                 ph.card_id

             AND latest.latest_date =
                 ph.snapshot_date

            WHERE ph.average IS NOT NULL

              AND ph.average > 0

          ) current_ref

            ON current_ref.card_id =
               previous.card_id

          WHERE previous.average IS NOT NULL

            AND previous.average > 0

            AND previous.snapshot_date = (

              SELECT
                MAX(history.snapshot_date)

              FROM price_history history

              WHERE history.card_id =
                    previous.card_id

                AND history.average IS NOT NULL

                AND history.average > 0

                AND history.snapshot_date <=
                    date(
                      current_ref.snapshot_date,
                      @dateOffset
                    )

            )

        ) previous_prices

          ON previous_prices.card_id =
             current_prices.card_id

         AND previous_prices.current_date =
             current_prices.current_date

        INNER JOIN cards c

          ON c.id =
             current_prices.card_id

        LEFT JOIN sets s

          ON s.id =
             c.set_id
        `).all({dateOffset:f}),h=[];for(let a of g){let b=Number(a.current_average),c=Number(a.previous_average);if(!Number.isFinite(b)||!Number.isFinite(c)||b<=0||c<=0)continue;let d=b-c,e=d/c*100;Number.isFinite(e)&&h.push({card:p(a),current:Math.round(100*b)/100,previous:Math.round(100*c)/100,change:Math.round(100*d)/100,percentage:Math.round(100*e)/100,currentDate:a.current_date,previousDate:a.previous_date})}return{gainers:h.filter(a=>a.percentage>0).sort((a,b)=>b.percentage-a.percentage).slice(0,e),losers:h.filter(a=>a.percentage<0).sort((a,b)=>a.percentage-b.percentage).slice(0,e)}}},4269:(a,b,c)=>{"use strict";c.d(b,{K6:()=>t,Md:()=>n,NS:()=>w,NX:()=>v,Th:()=>p,XF:()=>u});var d=c(3487);let e=new Map,f={cards:3e5,sets:18e5,options:18e5};function g(a){return String(a??"").trim()}function h(a){let b=e.get(a);return b?Date.now()>=b.expires?(e.delete(a),null):b.value:null}function i(a,b,c){e.set(a,{value:b,expires:Date.now()+c})}function j(a){return"string"!=typeof a?"/static/images/card-placeholder.png":a.trim()||"/static/images/card-placeholder.png"}function k(a){if("string"==typeof a)return a.trim()||void 0}function l(a){let b=a.images||{},c=a.set||{};return{...a,id:g(a.id),name:g(a.name),number:g(a.number),supertype:g(a.supertype),subtypes:Array.isArray(a.subtypes)?a.subtypes:[],types:Array.isArray(a.types)?a.types:[],rarity:g(a.rarity),evolvesFrom:g(a.evolvesFrom)||void 0,evolvesTo:Array.isArray(a.evolvesTo)?a.evolvesTo:[],rules:Array.isArray(a.rules)?a.rules:[],attacks:Array.isArray(a.attacks)?a.attacks:[],weaknesses:Array.isArray(a.weaknesses)?a.weaknesses:[],resistances:Array.isArray(a.resistances)?a.resistances:[],retreatCost:Array.isArray(a.retreatCost)?a.retreatCost:[],images:{small:j(b.small),large:j(b.large)},image_small:j(b.small),image_large:j(b.large),imageSmall:j(b.small),imageLarge:j(b.large),set:{id:g(c.id)||void 0,name:g(c.name)||void 0,series:g(c.series)||void 0,printedTotal:c.printedTotal,total:c.total,releaseDate:g(c.releaseDate)||void 0,updatedAt:g(c.updatedAt)||void 0,images:{symbol:k(c.images?.symbol),logo:k(c.images?.logo)}},tcgplayer:a.tcgplayer?a.tcgplayer:void 0,cardmarket:a.cardmarket?a.cardmarket:void 0}}function m(a){return{id:g(a.id),name:g(a.name),series:g(a.series)||void 0,printedTotal:a.printedTotal,total:a.total,releaseDate:g(a.releaseDate)||void 0,updatedAt:g(a.updatedAt)||void 0,images:{symbol:k(a.images?.symbol),logo:k(a.images?.logo)}}}async function n(a={},b=1,c=24){let e,j=g((e="string"==typeof a?{search:a,page:b,pageSize:c}:a||{}).search??e.q),k=g(e.setId),m=g(e.rarity),o=g(e.type),p=g(e.supertype),q=function(a){let b=Number(a);return!Number.isFinite(b)||b<1?1:Math.floor(b)}(e.page),r=function(a){let b=Number(a);return!Number.isFinite(b)||b<1?24:Math.min(Math.floor(b),100)}(e.pageSize),s=["search",j.toLowerCase(),k.toLowerCase(),m.toLowerCase(),o.toLowerCase(),p.toLowerCase(),q,r].join("|"),t=h(s);if(t)return t;try{let a=(0,d.PK)({search:j||void 0,setId:k||void 0,rarity:m||void 0,type:o||void 0,supertype:p||void 0,page:q,pageSize:r}),b={data:a.cards.map(l),page:a.page,pageSize:a.pageSize,count:a.cards.length,totalCount:a.total};return i(s,b,f.cards),b}catch(a){return console.error("Local Pok\xe9mon database search failed:",a instanceof Error?a.message:a),{data:[],page:q,pageSize:r,count:0,totalCount:0}}}async function o(a){let b=g(a);if(!b)return null;let c=`card:${b}`,e=h(c);if(e)return e;try{let a=(0,d.Th)(b);if(!a)return null;let e=l(a);return i(c,e,f.cards),e}catch(a){return console.error(`Failed to load local card ${b}:`,a instanceof Error?a.message:a),null}}async function p(a){return o(a)}async function q(){let a="sets",b=h(a);if(b)return b;try{let b=(0,d.VF)().map(m);return i(a,b,f.sets),b}catch(a){return console.error("Failed to load local Pok\xe9mon sets:",a instanceof Error?a.message:a),[]}}async function r(){let a="supertypes",b=h(a);if(b)return b;try{let b=(0,d.Sv)();return i(a,b,f.options),b}catch(a){return console.error("Failed to load local supertypes:",a instanceof Error?a.message:a),[]}}async function s(){let a="types",b=h(a);if(b)return b;try{let b=(0,d.pF)();return i(a,b,f.options),b}catch(a){return console.error("Failed to load local Pok\xe9mon types:",a instanceof Error?a.message:a),[]}}async function t(){let a="rarities",b=h(a);if(b)return b;try{let b=(0,d.Fs)();return i(a,b,f.options),b}catch(a){return console.error("Failed to load local rarities:",a instanceof Error?a.message:a),[]}}async function u(){let a="filter-options",b=h(a);if(b)return b;try{let[b,c,d,e]=await Promise.all([q(),r(),s(),t()]),g={sets:b,supertypes:c,types:d,rarities:e};return i(a,g,f.options),g}catch(a){return console.error("Failed to load filter options:",a instanceof Error?a.message:a),{sets:[],supertypes:[],types:[],rarities:[]}}}async function v(a=10){let b=Math.max(1,Math.min(Math.floor(Number(a)||10),50)),c=`rarest-cards:${b}`,e=h(c);if(e)return e;try{let a=(0,d.kR)(b).map(l);return a.length>0&&i(c,a,f.cards),a}catch(a){return console.error("Failed to load rarest cards:",a instanceof Error?a.message:a),[]}}function w(a){return j(a?.images?.small||a?.image_small||a?.imageSmall)}},5737:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,4160,23)),Promise.resolve().then(c.t.bind(c,1603,23)),Promise.resolve().then(c.t.bind(c,8495,23)),Promise.resolve().then(c.t.bind(c,5170,23)),Promise.resolve().then(c.t.bind(c,7526,23)),Promise.resolve().then(c.t.bind(c,8922,23)),Promise.resolve().then(c.t.bind(c,9234,23)),Promise.resolve().then(c.t.bind(c,2263,23)),Promise.resolve().then(c.bind(c,2146))},9289:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,1170,23)),Promise.resolve().then(c.t.bind(c,3597,23)),Promise.resolve().then(c.t.bind(c,6893,23)),Promise.resolve().then(c.t.bind(c,9748,23)),Promise.resolve().then(c.t.bind(c,6060,23)),Promise.resolve().then(c.t.bind(c,7184,23)),Promise.resolve().then(c.t.bind(c,9576,23)),Promise.resolve().then(c.t.bind(c,3041,23)),Promise.resolve().then(c.t.bind(c,1384,23))}};