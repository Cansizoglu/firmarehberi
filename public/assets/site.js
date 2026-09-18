document.addEventListener("click", function (e) {
  var b = e.target.closest(".mnu");
  if (b) { var n = document.querySelector(".nav"); n.classList.toggle("acik");
    b.setAttribute("aria-expanded", n.classList.contains("acik")); }
});
if (location.search.indexOf("y=1") > -1) {
  var k = document.createElement("p");
  k.className = "form-sonuc ok";
  k.textContent = "Yorumunuz alındı. Kontrol edildikten sonra yayınlanacak.";
  var f = document.querySelectorAll(".form-kart")[document.querySelectorAll(".form-kart").length - 1];
  if (f) f.insertBefore(k, f.firstChild);
}

/* Açılır menü */
document.addEventListener("click", function (e) {
  var b = e.target.closest(".mnu-grup > button");
  document.querySelectorAll(".mnu-grup.acik").forEach(function (g) {
    if (!b || g !== b.parentNode) g.classList.remove("acik");
  });
  if (b) { b.parentNode.classList.toggle("acik"); e.preventDefault(); }
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") document.querySelectorAll(".mnu-grup.acik").forEach(function (g) { g.classList.remove("acik"); });
});

/* Uyarı popup — oturumda bir kez */
(function () {
  var p = document.getElementById("uyariPop");
  if (!p) return;
  var anahtar = "anr_uyari_gorundu";
  try { if (sessionStorage.getItem(anahtar)) return; } catch (e) {}
  setTimeout(function () { p.hidden = false; p.style.display = "flex"; }, 1200);
  function kapat() {
    p.hidden = true;
    p.style.display = "none";          // CSS'e guvenme
    if (p.parentNode) p.parentNode.removeChild(p);
    try { sessionStorage.setItem(anahtar, "1"); } catch (e) {}
  }
  p.addEventListener("click", function (e) {
    if (e.target.closest("[data-pop-kapat]") || e.target === p) { e.preventDefault(); kapat(); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") kapat(); });
})();

/* Captcha hatası bildirimi */
if (location.search.indexOf("hata=captcha") > -1) {
  var u = document.createElement("p");
  u.className = "form-sonuc hata";
  u.textContent = "Güvenlik sorusunun cevabı yanlıştı. Lütfen tekrar deneyin.";
  var fk = document.querySelector(".form-kart form");
  if (fk) fk.insertBefore(u, fk.firstChild);
}
