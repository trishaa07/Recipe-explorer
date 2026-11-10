const API_URL = "https://dummyjson.com/recipes";
let allRecipes = [];
let selectedMealTypes = ["All"];
const $ = (id) => document.getElementById(id);
async function loadRecipes() {
  const grid = $("recipeGrid");
  const status = $("status");
  status.textContent = "Loading recipes...";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.recipes)) throw new Error("recipes array missing");
    allRecipes = data.recipes;
    window.allRecipes = allRecipes;
    buildCuisineOptions();
    renderMealChips();
    renderRecipes();
  } catch (error) {
    console.error("Recipe Explorer:", error);
    status.textContent = "Could not load recipes.";
    grid.innerHTML = `
      <div class="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 class="font-semibold text-red-700">Recipes could not be loaded</h2>
        <p class="mt-2 text-sm text-red-600">${error.message}</p>
      </div>`;
  }
}
function buildCuisineOptions() {
  const select = $("cuisineSelect");
  const cuisines = [
    ...new Set(allRecipes.map((r) => r.cuisine).filter(Boolean)),
  ].sort();
  select.innerHTML = '<option value="All">Cuisine: All</option>';
  cuisines.forEach((cuisine) => {
    const option = document.createElement("option");
    option.value = cuisine;
    option.textContent = `Cuisine: ${cuisine}`;
    select.appendChild(option);
  });
}
function renderMealChips() {
  $("mealChips").innerHTML = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Dessert",
  ]
    .map(
      (meal) => `
    <button type="button" class="meal-chip ${selectedMealTypes.includes(meal) ? "active" : ""}" data-meal="${meal}">${meal}</button>
  `,
    )
    .join("");
}
function getTotalTime(recipe) {
  return (
    Number(recipe.prepTimeMinutes || 0) + Number(recipe.cookTimeMinutes || 0)
  );
}
function getVisibleRecipes() {
  const search = $("searchInput").value.trim().toLowerCase();
  const cuisine = $("cuisineSelect").value;
  const difficulty = $("difficultySelect").value;

  let result = allRecipes.filter((recipe) => {
    const nameMatch = String(recipe.name || "")
      .toLowerCase()
      .includes(search);
    const meals = Array.isArray(recipe.mealType) ? recipe.mealType : [];
    const mealMatch =
      selectedMealTypes.includes("All") ||
      meals.some((m) => selectedMealTypes.includes(m));
    const cuisineMatch = cuisine === "All" || recipe.cuisine === cuisine;
    const difficultyMatch =
      difficulty === "All" || recipe.difficulty === difficulty;
    return nameMatch && mealMatch && cuisineMatch && difficultyMatch;
  });

  const sort = $("sortSelect").value;
  if (sort === "time-desc")
    result.sort((a, b) => getTotalTime(b) - getTotalTime(a));
  else if (sort === "rating-desc")
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === "calories-asc")
    result.sort(
      (a, b) => (a.caloriesPerServing || 0) - (b.caloriesPerServing || 0),
    );
  else result.sort((a, b) => getTotalTime(a) - getTotalTime(b));

  return result;
}

function renderRecipes() {
  const grid = $("recipeGrid");
  const empty = $("emptyState");
  const recipes = getVisibleRecipes();

  grid.innerHTML = "";

  if (!recipes.length) {
    empty.classList.remove("hidden");
    $("status").textContent = "0 recipes match the current filters.";
    return;
  }

  empty.classList.add("hidden");
  $("status").textContent = `${recipes.length} recipes shown`;

  recipes.forEach((recipe) => grid.appendChild(createCard(recipe)));
}
function createCard(recipe) {
  const card = document.createElement("article");
  card.className = "recipe-card";

  const meal =
    Array.isArray(recipe.mealType) && recipe.mealType.length
      ? recipe.mealType[0]
      : "Meal";

  card.innerHTML = `
    <img src="${recipe.image}" alt="${escapeHtml(recipe.name)}" class="w-full h-48 object-cover" onerror="this.src='https://placehold.co/600x400?text=Recipe'">
    <div class="p-4">
      <h2 class="font-bold text-lg leading-snug">${escapeHtml(recipe.name)}</h2>
      <div class="flex flex-wrap gap-2 mt-3">
        <span class="badge">${escapeHtml(recipe.cuisine)}</span>
        <span class="badge">${escapeHtml(meal)}</span>
        <span class="badge">${escapeHtml(recipe.difficulty)}</span>
      </div>
      <div class="flex justify-between gap-3 mt-4 text-sm text-slate-500">
        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>${getTotalTime(recipe)} min</span>
        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg>${recipe.caloriesPerServing} cal</span>
      </div>
    </div>`;

  card.addEventListener("click", () => openRecipeModal(recipe));
  return card;
}

function openRecipeModal(recipe) {
  const meal =
    Array.isArray(recipe.mealType) && recipe.mealType.length
      ? recipe.mealType[0]
      : "Meal";
  $("modalImage").src = recipe.image;
  $("modalImage").alt = recipe.name;
  $("modalTitle").textContent = recipe.name;
  $("modalBadges").innerHTML = `
    <span class="badge">${escapeHtml(recipe.cuisine)}</span>
    <span class="badge">${escapeHtml(meal)}</span>
    <span class="badge">${escapeHtml(recipe.difficulty)}</span>`;
  $("modalMeta").innerHTML = `
    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 680"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>${getTotalTime(recipe)} min</span>
    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 64C355.3 64 384 92.7 384 128C384 163.3 355.3 192 320 192C284.7 192 256 163.3 256 128C256 92.7 284.7 64 320 64zM416 376C416 401 403.3 423 384 435.9L384 528C384 554.5 362.5 576 336 576L304 576C277.5 576 256 554.5 256 528L256 435.9C236.7 423 224 401 224 376L224 336C224 283 267 240 320 240C373 240 416 283 416 336L416 376zM160 96C190.9 96 216 121.1 216 152C216 182.9 190.9 208 160 208C129.1 208 104 182.9 104 152C104 121.1 129.1 96 160 96zM176 336L176 368C176 400.5 188.1 430.1 208 452.7L208 528C208 529.2 208 530.5 208.1 531.7C199.6 539.3 188.4 544 176 544L144 544C117.5 544 96 522.5 96 496L96 439.4C76.9 428.4 64 407.7 64 384L64 352C64 299 107 256 160 256C172.7 256 184.8 258.5 195.9 262.9C183.3 284.3 176 309.3 176 336zM432 528L432 452.7C451.9 430.2 464 400.5 464 368L464 336C464 309.3 456.7 284.4 444.1 262.9C455.2 258.4 467.3 256 480 256C533 256 576 299 576 352L576 384C576 407.7 563.1 428.4 544 439.4L544 496C544 522.5 522.5 544 496 544L464 544C451.7 544 440.4 539.4 431.9 531.7C431.9 530.5 432 529.2 432 528zM480 96C510.9 96 536 121.1 536 152C536 182.9 510.9 208 480 208C449.1 208 424 182.9 424 152C424 121.1 449.1 96 480 96z"/></svg></svg> ${recipe.servings} servings</span>
    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 600"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg> ${recipe.caloriesPerServing} cal</span>`;
  $("modalIngredients").innerHTML = (recipe.ingredients || [])
    .map((x) => `<li>${escapeHtml(x)}</li>`)
    .join("");
  $("modalInstructions").innerHTML = (recipe.instructions || [])
    .map(
      (x, i) => `
    <li class="instruction-item"><span class="instruction-number">${i + 1}</span><span>${escapeHtml(x)}</span></li>`,
    )
    .join("");
  $("recipeModal").classList.remove("hidden");
  $("recipeModal").classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

function closeRecipeModal() {
  $("recipeModal").classList.add("hidden");
  $("recipeModal").classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  $("searchInput").addEventListener("input", renderRecipes);
  $("sortSelect").addEventListener("change", renderRecipes);
  $("cuisineSelect").addEventListener("change", renderRecipes);
  $("difficultySelect").addEventListener("change", renderRecipes);
  $("clearFilters").addEventListener("click", () => {
    $("searchInput").value = "";
    $("sortSelect").value = "time-asc";
    $("cuisineSelect").value = "All";
    $("difficultySelect").value = "All";
    selectedMealTypes = ["All"];
    renderMealChips();
    renderRecipes();
  });
  $("mealChips").addEventListener("click", (e) => {
    const button = e.target.closest("[data-meal]");
    if (!button) return;
    const meal = button.dataset.meal;
    if (meal === "All") selectedMealTypes = ["All"];
    else {
      selectedMealTypes = selectedMealTypes.filter((x) => x !== "All");
      selectedMealTypes = selectedMealTypes.includes(meal)
        ? selectedMealTypes.filter((x) => x !== meal)
        : [...selectedMealTypes, meal];
      if (!selectedMealTypes.length) selectedMealTypes = ["All"];
    }
    renderMealChips();
    renderRecipes();
  });
  $("closeModal").addEventListener("click", closeRecipeModal);
  $("recipeModal").addEventListener("click", (e) => {
    if (e.target === $("recipeModal")) closeRecipeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeRecipeModal();
  });
  loadRecipes();
});
