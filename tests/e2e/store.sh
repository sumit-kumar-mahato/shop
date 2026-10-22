#!/usr/bin/env bash
# Store end-to-end checks: pages, security, accounts, cart, checkout, orders, admin, reviews, uploads.
# Usage: bash tests/e2e/store.sh [base-url]   (default http://localhost:3100, server must be running)
. "$(dirname "$0")/lib.sh"

echo "== Public pages"
for p in / /shop "/shop?gender=men&size=M&sort=price-asc" "/shop?q=linen" /product/classic-white-linen-shirt /offers /blog /blog/the-heritage-of-banarasi-silk /about /contact /policies/returns /login /register /cart /sitemap.xml /robots.txt; do
  check "GET $p" 200 "$(code "$B$p")"
done
check "unknown product 404" 404 "$(code "$B/product/does-not-exist")"
PID=$(sql "select id from \"Product\" where slug='classic-white-linen-shirt'")
check "legacy /product/<id> redirects" 308 "$(code "$B/product/$PID")"
check "search API" 200 "$(code "$B/api/search?q=silk")"
check "security header CSP present" 1 "$(curl -sI "$B/" | grep -ci '^content-security-policy')"

echo "== Admin protection (signed out)"
check "/admin redirects to login" 307 "$(code "$B/admin")"
check "create product unauth -> 401" 401 "$(code -X POST -H "$J" -d '{}' "$B/api/admin/products")"
check "delete product unauth -> 401" 401 "$(code -X DELETE "$B/api/admin/products/$PID")"
check "update settings unauth -> 401" 401 "$(code -X PUT -H "$J" -d '{}' "$B/api/admin/settings/store")"
check "old forged admin cookie rejected" 401 "$(code -X DELETE -b 'admin_token=authenticated-session-token' "$B/api/admin/products/$PID")"
check "forged session cookie rejected" 401 "$(code -X DELETE -b 'pkm_session=eyJhbGciOiJIUzI1NiJ9.eyJzaWQiOiJ4Iiwicm9sZSI6IkFETUlOIiwic3ViIjoieCJ9.bad' "$B/api/admin/products/$PID")"
check "cross-site POST blocked" 403 "$(code -X POST -H "$J" -H 'Origin: https://evil.example' -d '{"email":"a@b.co","password":"x"}' "$B/api/auth/login")"
check "/account redirects to login" 307 "$(code "$B/account")"

echo "== Customer registration & login"
C1="$DIR/c1"; C2="$DIR/c2"; AD="$DIR/admin"
EMAIL="buyer$RANDOM@example.com"
check "weak password rejected" 400 "$(code -c "$C1" -X POST -H "$J" -d "{\"name\":\"Asha Buyer\",\"email\":\"$EMAIL\",\"password\":\"short\"}" "$B/api/auth/register")"
check "register" 201 "$(code -c "$C1" -X POST -H "$J" -d "{\"name\":\"Asha Buyer\",\"email\":\"$EMAIL\",\"password\":\"Secret123!\"}" "$B/api/auth/register")"
check "duplicate email -> 409" 409 "$(code -X POST -H "$J" -d "{\"name\":\"Asha Buyer\",\"email\":\"$EMAIL\",\"password\":\"Secret123!\"}" "$B/api/auth/register")"
check "customer cannot use admin API -> 403" 403 "$(code -b "$C1" -X DELETE "$B/api/admin/products/$PID")"
check "customer /admin redirected" 307 "$(code -b "$C1" "$B/admin")"
check "account page" 200 "$(code -b "$C1" "$B/account")"
check "wrong password -> 401" 401 "$(code -X POST -H "$J" -d "{\"email\":\"$EMAIL\",\"password\":\"Wrong1234\"}" "$B/api/auth/login")"

echo "== Cart, coupon, checkout (COD)"
VID=$(sql "select v.id from \"ProductVariant\" v join \"Product\" p on p.id=v.\"productId\" where p.slug='oversized-supima-cotton-t-shirt' and v.size='M' and v.color='Black'")
STOCK0=$(sql "select stock from \"ProductVariant\" where id='$VID'")
check "add to cart" 200 "$(code -b "$C1" -X POST -H "$J" -d "{\"variantId\":\"$VID\",\"quantity\":2}" "$B/api/cart")"
TOTAL=$(curl -s -b "$C1" "$B/api/cart?coupon=WELCOME10" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const q=JSON.parse(s);console.log(q.totals.subtotal+'/'+q.totals.discount+'/'+q.totals.total+'/'+q.coupon.applied)})")
check "server-priced quote with coupon (subtotal/discount/total/applied)" "259800/25980/233820/true" "$TOTAL"
check "invalid coupon not applied" false "$(curl -s -b "$C1" "$B/api/cart?coupon=NOPE123" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).coupon.applied))")"
ADDR=$(curl -s -b "$C1" -X POST -H "$J" -d '{"fullName":"Asha Buyer","phone":"9876543210","line1":"12 MG Road","city":"Ranchi","state":"Jharkhand","postalCode":"834001"}' "$B/api/account/addresses" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).address.id))")
check "bad PIN code rejected" 400 "$(code -b "$C1" -X POST -H "$J" -d '{"fullName":"A B","phone":"9876543210","line1":"12 MG Road","city":"Ranchi","state":"Jharkhand","postalCode":"12"}' "$B/api/account/addresses")"
ORDER=$(curl -s -b "$C1" -X POST -H "$J" -d "{\"addressId\":\"$ADDR\",\"paymentMethod\":\"COD\",\"couponCode\":\"WELCOME10\"}" "$B/api/checkout")
ONUM=$(echo "$ORDER" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).orderNumber||s))")
echo "  order: $ONUM"
check "order total stored from server (free shipping after discount)" 233820 "$(sql "select total from \"Order\" where \"orderNumber\"='$ONUM'")"
check "stock decremented by 2" $((STOCK0-2)) "$(sql "select stock from \"ProductVariant\" where id='$VID'")"
check "coupon usage counted" 1 "$(sql "select \"usageCount\" from \"Coupon\" where code='WELCOME10'")"
check "cart cleared after order" 0 "$(sql "select count(*) from \"CartItem\" ci join \"User\" u on u.id=ci.\"userId\" where u.email='$EMAIL'")"
check "order page visible to owner" 200 "$(code -b "$C1" "$B/account/orders/$ONUM")"
check "invoice visible to owner" 200 "$(code -b "$C1" "$B/invoice/$ONUM")"

curl -s -b "$C1" -X POST -H "$J" -d "{\"variantId\":\"$VID\",\"quantity\":1}" "$B/api/cart" >/dev/null
check "coupon reuse blocked (per-user limit)" 400 "$(code -b "$C1" -X POST -H "$J" -d "{\"addressId\":\"$ADDR\",\"paymentMethod\":\"COD\",\"couponCode\":\"WELCOME10\"}" "$B/api/checkout")"

echo "== Overselling protection"
sql "update \"ProductVariant\" set stock=1 where id='$VID'" >/dev/null
curl -s -b "$C1" -X PUT -H "$J" -d "{\"variantId\":\"$VID\",\"quantity\":3}" "$B/api/cart" >/dev/null
check "cannot order more than stock -> 409" 409 "$(code -b "$C1" -X POST -H "$J" -d "{\"addressId\":\"$ADDR\",\"paymentMethod\":\"COD\"}" "$B/api/checkout")"
check "stock unchanged after rejected order" 1 "$(sql "select stock from \"ProductVariant\" where id='$VID'")"
sql "update \"ProductVariant\" set stock=$((STOCK0-2)) where id='$VID'" >/dev/null
curl -s -b "$C1" -X DELETE "$B/api/cart" >/dev/null

echo "== Privacy (another customer)"
curl -s -c "$C2" -X POST -H "$J" -d "{\"name\":\"Other Person\",\"email\":\"other$RANDOM@example.com\",\"password\":\"Secret123!\"}" "$B/api/auth/register" >/dev/null
check "other customer cannot view order" 404 "$(code -b "$C2" "$B/account/orders/$ONUM")"
check "other customer cannot view invoice" 404 "$(code -b "$C2" "$B/invoice/$ONUM")"
check "other customer cannot cancel" 404 "$(code -b "$C2" -X POST -H "$J" -d '{}' "$B/api/orders/$ONUM/cancel")"
check "other customer cannot edit address" 404 "$(code -b "$C2" -X DELETE "$B/api/account/addresses/$ADDR")"

echo "== Customer cancels -> stock & coupon restored"
check "cancel order" 200 "$(code -b "$C1" -X POST -H "$J" -d '{"reason":"changed mind"}' "$B/api/orders/$ONUM/cancel")"
check "stock restored" "$STOCK0" "$(sql "select stock from \"ProductVariant\" where id='$VID'")"
check "coupon usage released" 0 "$(sql "select \"usageCount\" from \"Coupon\" where code='WELCOME10'")"
check "cancel twice rejected" 400 "$(code -b "$C1" -X POST -H "$J" -d '{}' "$B/api/orders/$ONUM/cancel")"

echo "== Admin workflow"
check "admin login" 200 "$(code -c "$AD" -X POST -H "$J" -d '{"email":"admin@localhost.test","password":"LocalAdmin@2026"}' "$B/api/auth/login")"
for p in /admin /admin/orders /admin/products /admin/products/new "/admin/products/$PID" /admin/categories /admin/customers /admin/coupons /admin/reviews /admin/blog /admin/homepage /admin/pages /admin/settings /admin/messages /admin/activity; do
  check "admin GET $p" 200 "$(code -b "$AD" "$B$p")"
done
# New order for fulfilment flow
curl -s -b "$C1" -X POST -H "$J" -d "{\"variantId\":\"$VID\",\"quantity\":1}" "$B/api/cart" >/dev/null
ONUM2=$(curl -s -b "$C1" -X POST -H "$J" -d "{\"addressId\":\"$ADDR\",\"paymentMethod\":\"COD\"}" "$B/api/checkout" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).orderNumber))")
OID=$(sql "select id from \"Order\" where \"orderNumber\"='$ONUM2'")
check "admin order page" 200 "$(code -b "$AD" "$B/admin/orders/$OID")"
check "invalid transition CONFIRMED->DELIVERED rejected" 400 "$(code -b "$AD" -X PATCH -H "$J" -d '{"status":"DELIVERED"}' "$B/api/admin/orders/$OID")"
check "ship with tracking" 200 "$(code -b "$AD" -X PATCH -H "$J" -d '{"status":"SHIPPED","courierName":"Delhivery","trackingNumber":"DL123","notifyCustomer":true}' "$B/api/admin/orders/$OID")"
check "deliver" 200 "$(code -b "$AD" -X PATCH -H "$J" -d '{"status":"DELIVERED"}' "$B/api/admin/orders/$OID")"
check "COD marked paid on delivery" PAID "$(sql "select \"paymentStatus\" from \"Order\" where id='$OID'")"
check "customer requests return" 200 "$(code -b "$C1" -X POST -H "$J" -d '{"reason":"Size too small"}' "$B/api/orders/$ONUM2/return")"
check "orders CSV export" 200 "$(code -b "$AD" "$B/api/admin/orders/export")"

echo "== Reviews moderation"
check "customer posts review" 201 "$(code -b "$C1" -X POST -H "$J" -d "{\"productId\":\"$(sql "select \"productId\" from \"ProductVariant\" where id='$VID'")\",\"rating\":5,\"comment\":\"Lovely soft fabric and great fit.\"}" "$B/api/reviews")"
RID=$(sql "select id from \"Review\" order by \"createdAt\" desc limit 1")
check "review pending (verified purchase)" "PENDING|true" "$(sql "select status||'|'||\"isVerifiedPurchase\" from \"Review\" where id='$RID'")"
check "admin approves review" 200 "$(code -b "$AD" -X PATCH -H "$J" -d '{"status":"APPROVED"}' "$B/api/admin/reviews/$RID")"

echo "== Admin content & uploads"
PNG="$DIR/t.png"; node -e "require('fs').writeFileSync(process.argv[1], Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64'))" "$PNG"
URL=$(curl -s -b "$AD" -F "file=@$PNG;type=image/png" "$B/api/admin/uploads" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).url))")
check "uploaded image served" 200 "$(code "$B$URL")"
echo '<svg onload=alert(1)>' > "$DIR/x.svg"
check "SVG upload rejected" 415 "$(code -b "$AD" -F "file=@$DIR/x.svg;type=image/png" "$B/api/admin/uploads")"
check "customer cannot upload" 403 "$(code -b "$C1" -F "file=@$PNG;type=image/png" "$B/api/admin/uploads")"
check "javascript: link rejected in settings" 400 "$(curl -s -b "$AD" "$B/admin/settings" >/dev/null; code -b "$AD" -X PUT -H "$J" -d '{"announcement":{"enabled":true,"text":"hi","link":"javascript:alert(1)"}}' "$B/api/admin/settings/store")"
check "create coupon" 201 "$(code -b "$AD" -X POST -H "$J" -d '{"code":"TEST50","type":"FIXED","value":5000,"isActive":true,"isPublic":false}' "$B/api/admin/coupons")"
check "audit log recorded" 1 "$( [ "$(sql "select count(*) from \"AuditLog\"")" -gt 3 ] && echo 1 || echo 0)"

echo "== Login rate limit"
RL=""
for i in $(seq 1 9); do RL=$(code -X POST -H "$J" -d "{\"email\":\"$EMAIL\",\"password\":\"Wrong$i$i$i$i\"}" "$B/api/auth/login"); done
check "9th bad password attempt throttled" 429 "$RL"

rm -rf "$DIR"
finish
