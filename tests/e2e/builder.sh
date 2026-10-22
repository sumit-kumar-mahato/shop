#!/usr/bin/env bash
# Website-builder checks: settings sections, drafts + live preview, bulk actions, admin search.
# Usage: bash tests/e2e/builder.sh [base-url]   (default http://localhost:3100, server must be running)
. "$(dirname "$0")/lib.sh"
AD="$DIR/f-admin"; CU="$DIR/f-cust"

echo "== Sign in"
check "admin login" 200 "$(code -c "$AD" -X POST -H "$J" -d '{"email":"admin@localhost.test","password":"LocalAdmin@2026"}' "$B/api/auth/login")"
check "customer register" 201 "$(code -c "$CU" -X POST -H "$J" -d "{\"name\":\"Preview Peeker\",\"email\":\"peek$RANDOM$RANDOM@example.com\",\"password\":\"Secret123!\"}" "$B/api/auth/register")"

echo "== New admin pages"
for p in /admin /admin?range=7 /admin?range=90 /admin/appearance /admin/navigation /admin/product-page /admin/engagement /admin/homepage "/admin/products?flag=isNewArrival" "/admin/products?status=DRAFT" "/admin/orders?status=CONFIRMED"; do
  check "GET $p" 200 "$(code -b "$AD" "$B$p")"
done
check "customer blocked from /admin/appearance" 307 "$(code -b "$CU" "$B/admin/appearance")"

echo "== Settings API"
check "unknown section 404" 404 "$(code -b "$AD" -X PUT -H "$J" -d '{}' "$B/api/admin/settings/nope")"
check "prototype key rejected" 404 "$(code -b "$AD" -X PUT -H "$J" -d '{}' "$B/api/admin/settings/constructor")"
check "customer cannot save theme" 403 "$(code -b "$CU" -X PUT -H "$J" -d '{}' "$B/api/admin/settings/theme")"
check "invalid theme rejected" 400 "$(code -b "$AD" -X PUT -H "$J" -d '{"primaryColor":"red"}' "$B/api/admin/settings/theme")"
check "pages has no draft mode" 400 "$(code -b "$AD" -X PUT -H "$J" -d '{}' "$B/api/admin/settings/pages?draft=1")"

THEME=$(node -e '
const t={primaryColor:"#9f1239",headingFont:"cormorant",bodyFont:"jost",logoFont:"marcellus",corners:"rounded",buttons:"square",colorMode:"dark",allowThemeToggle:false,animations:false,
logo:{image:"",darkImage:"",height:40},favicon:"",header:{transparentOnHero:false,megaMenu:false},
productCard:{imageRatio:"square",hoverImage:false,quickAdd:false,showRating:false,showCategory:false,showColors:false,lowStockBadgeAt:0}};
process.stdout.write(JSON.stringify(t))')
check "publish theme" 200 "$(code -b "$AD" -X PUT -H "$J" -d "$THEME" "$B/api/admin/settings/theme")"
HTML=$(curl -s "$B/")
check "brand colour applied" 1 "$(echo "$HTML" | grep -c 'brand-rgb:159 18 57')"
check "heading font applied" 1 "$(echo "$HTML" | grep -c 'font-serif:var(--f-cormorant)')"
check "animations off adds no-motion" 1 "$(echo "$HTML" | grep -c 'class="[^"]*no-motion')"
check "rounded corners var" 1 "$(echo "$HTML" | grep -c 'radius-sm:1rem')"
check "dark default in theme script" 1 "$(echo "$HTML" | grep -c '\\"mode\\":\\"dark\\"\|"mode":"dark"')"
check "mega menu off -> plain Shop link" 0 "$(echo "$HTML" | grep -c 'aria-expanded')"

NAV='{"headerLinks":[{"label":"Festive Sale","href":"/shop?sale=1","highlight":true}],"footer":{"about":"Family-run since 1990.","columns":[{"title":"Visit","autoCategories":false,"links":[{"label":"Find us","href":"/contact","highlight":false}]}],"showNewsletter":false,"newsletterTitle":"","newsletterText":"","showWordmark":false,"wordmarkText":"","showPaymentIcons":true,"bottomLinks":[],"copyright":"Copyright PKM test line"}}'
check "publish navigation" 200 "$(code -b "$AD" -X PUT -H "$J" -d "$NAV" "$B/api/admin/settings/navigation")"
HTML=$(curl -s "$B/shop")
check "header link shown" 1 "$(echo "$HTML" | grep -c 'Festive Sale')"
check "footer about text" 1 "$(echo "$HTML" | grep -c 'Family-run since 1990.')"
check "custom copyright" 1 "$(echo "$HTML" | grep -c 'Copyright PKM test line')"
check "javascript: nav link rejected" 400 "$(code -b "$AD" -X PUT -H "$J" -d '{"headerLinks":[{"label":"x","href":"javascript:alert(1)"}],"footer":{"about":"","columns":[],"showNewsletter":false,"newsletterTitle":"","newsletterText":"","showWordmark":false,"wordmarkText":"","showPaymentIcons":false,"bottomLinks":[],"copyright":""}}' "$B/api/admin/settings/navigation")"

echo "== Homepage blocks + draft preview"
HOME_JSON=$(node -e '
const home={sections:[{id:"hero",enabled:true},{id:"block-tst1",enabled:true},{id:"block-tst2",enabled:true},{id:"block-tst3",enabled:true},{id:"block-gone",enabled:true}],
hero:{height:"large",autoplaySeconds:5,kenBurns:false},
banners:[{id:"b1",eyebrow:"",title:"Published hero",description:"",buttonText:"Shop",link:"/shop",image:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800",align:"left"}],
services:[],sectionText:{categories:{eyebrow:"",title:"C"},"new-arrivals":{eyebrow:"",title:"N"},"best-sellers":{eyebrow:"",title:"B"},featured:{eyebrow:"",title:"F"},trending:{eyebrow:"",title:"T"},testimonials:{eyebrow:"",title:"R"}},
promo:{eyebrow:"",title:"",subtitle:"",buttonText:"",link:"",image:""},flashSale:{badge:"",title:"",subtitle:"",endsAt:"",buttonText:"",link:""},
brandStory:{eyebrow:"",title:"",body:"",image:"",badgeTitle:"",badgeText:"",buttonText:"",link:""},newsletter:{eyebrow:"",title:"",description:""},
blocks:[
 {type:"marquee",id:"block-tst1",items:["Zari Week Marquee"],style:"brand",speed:"fast"},
 {type:"faq",id:"block-tst2",eyebrow:"Help",title:"Questions",items:[{question:"Do you ship to Ranchi?",answer:"Yes."}]},
 {type:"products",id:"block-tst3",eyebrow:"",title:"Picked For Test",source:"newest",category:"",gender:"WOMEN",limit:4,layout:"grid",buttonText:"",link:""}
]};
process.stdout.write(JSON.stringify(home))')
check "publish homepage with blocks" 200 "$(code -b "$AD" -X PUT -H "$J" -d "$HOME_JSON" "$B/api/admin/settings/homepage")"
HTML=$(curl -s "$B/")
check "old banner (no new fields) defaults applied" 1 "$(echo "$HTML" | grep -c 'Published hero')"
check "marquee block rendered" 1 "$([ "$(echo "$HTML" | grep -o 'Zari Week Marquee' | wc -l)" -ge 1 ] && echo 1 || echo 0)"
check "faq block + FAQ schema" 1 "$(echo "$HTML" | grep -c 'FAQPage')"
check "products block rendered" 1 "$(echo "$HTML" | grep -c 'Picked For Test')"
check "unsafe block id rejected" 400 "$(code -b "$AD" -X PUT -H "$J" -d "$(echo "$HOME_JSON" | sed 's/block-tst1"/block-X<1"/g')" "$B/api/admin/settings/homepage")"

DRAFT=$(echo "$HOME_JSON" | sed 's/Published hero/Draft hero only/')
check "save draft" 200 "$(code -b "$AD" -X PUT -H "$J" -d "$DRAFT" "$B/api/admin/settings/homepage?draft=1")"
check "public still sees published" 0 "$(curl -s "$B/?pkm_preview=1" | grep -c 'Draft hero only')"
check "customer with preview flag sees published" 0 "$(curl -s -b "$CU" "$B/?pkm_preview=1" | grep -c 'Draft hero only')"
check "spoofed preview header ignored for customer" 0 "$(curl -s -b "$CU" -H 'x-pkm-preview: 1' "$B/" | grep -c 'Draft hero only')"
check "admin without flag sees published" 0 "$(curl -s -b "$AD" "$B/" | grep -c 'Draft hero only')"
PREV=$(curl -s -D "$DIR/prev-h" -b "$AD" "$B/?pkm_preview=1")
check "admin preview shows draft" 1 "$(echo "$PREV" | grep -c 'Draft hero only')"
check "preview not cacheable" 1 "$(grep -ci 'cache-control: private, no-store' "$DIR/prev-h")"
check "draft row stored" 1 "$(sql "select count(*) from \"Setting\" where key='draft:homepage'")"
check "publish clears draft" 200 "$(code -b "$AD" -X PUT -H "$J" -d "$HOME_JSON" "$B/api/admin/settings/homepage")"
check "draft row removed" 0 "$(sql "select count(*) from \"Setting\" where key='draft:homepage'")"
check "same-origin framing allowed" 1 "$(curl -sI "$B/" | grep -ci 'x-frame-options: SAMEORIGIN')"
check "csp frame-ancestors self" 1 "$(curl -sI "$B/" | grep -ci "frame-ancestors 'self'")"

echo "== Product page + popups"
PP='{"showDeliveryInfo":false,"highlights":[{"icon":"scissors","text":"Tailored in Chowka test"}],"showShare":false,"showReviews":false,"showCompleteTheLook":true,"completeTheLookTitle":"Wear It With Test","showRecentlyViewed":false,"sizeGuide":{"enabled":true,"intro":"","columns":["Size","Length"],"rows":[["S","27"]],"note":""}}'
check "publish product page" 200 "$(code -b "$AD" -X PUT -H "$J" -d "$PP" "$B/api/admin/settings/productPage")"
HTML=$(curl -s "$B/product/classic-white-linen-shirt")
check "custom highlight" 1 "$(echo "$HTML" | grep -c 'Tailored in Chowka test')"
check "carousel title" 1 "$(echo "$HTML" | grep -c 'Wear It With Test')"
check "delivery info hidden" 0 "$(echo "$HTML" | grep -c 'Cash on Delivery available')"
check "quick view API carries page options" 1 "$(curl -s "$B/api/products/classic-white-linen-shirt" | grep -c 'Tailored in Chowka test')"
EN='{"popup":{"enabled":true,"showOn":"all","delaySeconds":0,"frequencyDays":7,"image":"","eyebrow":"Hi","title":"Welcome test popup","text":"","couponCode":"WELCOME10","collectEmail":true,"buttonText":"","link":""},"whatsapp":{"enabled":true,"message":"Hello"},"freeShippingBar":false}'
check "publish engagement" 200 "$(code -b "$AD" -X PUT -H "$J" -d "$EN" "$B/api/admin/settings/engagement")"
check "popup config sent to page" 1 "$(curl -s "$B/shop" | grep -c 'Welcome test popup')"

echo "== Bulk actions + search"
PIDS=$(sql "select string_agg('\"'||id||'\"', ',') from (select id from \"Product\" where status='ACTIVE' order by \"createdAt\" limit 2) t")
check "bulk flag" 200 "$(code -b "$AD" -X POST -H "$J" -d "{\"action\":\"flag\",\"ids\":[$PIDS],\"flag\":\"isTrending\",\"value\":true}" "$B/api/admin/products/bulk")"
check "flag applied" 2 "$(sql "select count(*) from \"Product\" where id in ($(echo $PIDS | tr '"' "'")) and \"isTrending\"")"
check "bulk bad flag rejected" 400 "$(code -b "$AD" -X POST -H "$J" -d "{\"action\":\"flag\",\"ids\":[$PIDS],\"flag\":\"price\",\"value\":true}" "$B/api/admin/products/bulk")"
check "customer cannot bulk edit" 403 "$(code -b "$CU" -X POST -H "$J" -d "{\"action\":\"status\",\"ids\":[$PIDS],\"status\":\"DRAFT\"}" "$B/api/admin/products/bulk")"
check "bulk flag off" 200 "$(code -b "$AD" -X POST -H "$J" -d "{\"action\":\"flag\",\"ids\":[$PIDS],\"flag\":\"isTrending\",\"value\":false}" "$B/api/admin/products/bulk")"
OID=$(sql "select id from \"Order\" where status='CONFIRMED' order by \"createdAt\" desc limit 1")
if [ -n "$OID" ]; then
  R=$(curl -s -b "$AD" -X POST -H "$J" -d "{\"ids\":[\"$OID\"],\"status\":\"PROCESSING\"}" "$B/api/admin/orders/bulk")
  check "bulk order -> packing" 1 "$(echo "$R" | grep -c '"updated":1')"
  R=$(curl -s -b "$AD" -X POST -H "$J" -d "{\"ids\":[\"$OID\"],\"status\":\"PROCESSING\"}" "$B/api/admin/orders/bulk")
  check "invalid transition skipped, not crashed" 1 "$(echo "$R" | grep -c '"updated":0')"
fi
check "admin search" 1 "$(curl -s -b "$AD" "$B/api/admin/search?q=linen" | grep -c 'Linen')"
check "customer search blocked" 403 "$(code -b "$CU" "$B/api/admin/search?q=linen")"

echo "== Restore defaults"
for k in theme navigation homepage productPage engagement; do sql "delete from \"Setting\" where key in ('$k','draft:$k')" >/dev/null; done
check "defaults back" 200 "$(code "$B/")"

finish
