const results = document.querySelector('.results');
if (results) {
  const category = document.querySelector('#category');
  const year = document.querySelector('#year');
  const find = document.querySelector('.find');
  const query = find.querySelector('input');
  function filter() {
    const term = query.value.trim().toLocaleLowerCase();
    for (const tile of results.children) {
      tile.hidden = (category.value && tile.dataset.series !== category.value) ||
        (year.value && !tile.querySelector('time').textContent.startsWith(year.value)) ||
        !tile.lastElementChild.textContent.toLocaleLowerCase().includes(term);
    }
  }
  category.addEventListener('change', filter);
  year.addEventListener('change', filter);
  query.addEventListener('input', filter);
  find.addEventListener('toggle', () => {
    if (find.open) {
      document.querySelector('#all-writing').scrollIntoView();
      query.focus();
    } else {
      query.value = '';
      filter();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey &&
        !event.altKey && !event.target.matches('input, select, textarea')) {
      event.preventDefault();
      find.open = true;
    }
  });
  document.querySelector('#grid').onclick = () => results.classList.remove('list');
  document.querySelector('#list').onclick = () => results.classList.add('list');
}

document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() === 'm' && !event.ctrlKey && !event.metaKey &&
      !event.altKey && !event.target.matches('input, select, textarea')) {
    event.preventDefault();
    const menu = document.querySelector('.menu');
    menu.open = !menu.open;
    menu.querySelector('summary').focus();
  }
});
