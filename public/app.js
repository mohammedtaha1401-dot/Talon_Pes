async function editNews(id) {

  const confirmEdit = confirm(
    "آیا مطمئن هستید که می‌خواهید این خبر را ویرایش کنید؟"
  );

  if (!confirmEdit) return;

  const title =
    prompt("عنوان جدید:");

  if (!title) return;

  const content =
    prompt("متن جدید:");

  if (!content) return;

  await api(`/api/news/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title,
      content
    })
  });

  alert("خبر ویرایش شد ✅");

  await loadNews();
  await loadAdminNews();
}


async function editGame(id) {

  const confirmEdit = confirm(
    "آیا مطمئن هستید که می‌خواهید این بازی را ویرایش کنید؟"
  );

  if (!confirmEdit) return;

  const home_team =
    prompt("نام تیم اول:");

  if (!home_team) return;

  const away_team =
    prompt("نام تیم دوم:");

  if (!away_team) return;

  const home_score =
    Number(prompt("گل تیم اول:", "0")) || 0;

  const away_score =
    Number(prompt("گل تیم دوم:", "0")) || 0;

  const date =
    prompt("تاریخ بازی:");

  await api(`/api/games/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      home_team,
      away_team,
      home_score,
      away_score,
      date
    })
  });

  alert("بازی ویرایش شد ✅");

  await loadGames();
  await loadAdminGames();
}


async function editStanding(id) {

  const confirmEdit = confirm(
    "آیا مطمئن هستید که می‌خواهید این تیم را ویرایش کنید؟"
  );

  if (!confirmEdit) return;

  const team =
    prompt("نام تیم:");

  if (!team) return;

  const played =
    Number(prompt("بازی:", "0")) || 0;

  const wins =
    Number(prompt("برد:", "0")) || 0;

  const draws =
    Number(prompt("مساوی:", "0")) || 0;

  const losses =
    Number(prompt("باخت:", "0")) || 0;

  const points =
    Number(prompt("امتیاز:", "0")) || 0;

  await api(`/api/standings/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      team,
      played,
      wins,
      draws,
      losses,
      points
    })
  });

  alert("جدول ویرایش شد ✅");

  await loadStandings();
  await loadAdminStandings();
}


async function editHonor(id) {

  const confirmEdit = confirm(
    "آیا مطمئن هستید که می‌خواهید این افتخار را ویرایش کنید؟"
  );

  if (!confirmEdit) return;

  const name =
    prompt("نام مربی:");

  if (!name) return;

  const points =
    Number(prompt("امتیاز:", "0")) || 0;

  await api(`/api/honors/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      points
    })
  });

  alert("افتخار ویرایش شد ✅");

  await loadHonors();
  await loadAdminHonors();
}
