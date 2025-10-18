fetch("/components/header.html")
  .then(r => r.text())
  .then(h => document.getElementById("site-header").innerHTML = h);
