const transport = {
  truck: { length: 13.6, width: 2.45, height: 2.7, weight: 20000, bay: 'truckBay', cargo: 'truckCargo', result: 'truckResult' },
  gazelle: { length: 4.2, width: 2.0, height: 2.1, weight: 1500, bay: 'gazelleBay', cargo: 'gazelleCargo', result: 'gazelleResult' },
};

const fields = ['fromCity', 'toCity', 'length', 'width', 'height', 'weight', 'comment'].reduce((acc, id) => {
  acc[id] = document.getElementById(id);
  return acc;
}, {});

function numberValue(id, fallback) {
  const value = Number.parseFloat(fields[id].value.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function setResult(element, text, state) {
  element.textContent = text;
  element.className = `result-text ${state}`;
}

function updateTransport(type) {
  const spec = transport[type];
  const bay = document.getElementById(spec.bay);
  const cargo = document.getElementById(spec.cargo);
  const result = document.getElementById(spec.result);
  const length = numberValue('length', 1.2);
  const width = numberValue('width', 0.8);
  const height = numberValue('height', 1.2);
  const weight = numberValue('weight', 100);

  const bayWidth = bay.clientWidth - 28;
  const bayHeight = bay.clientHeight - 28;
  const visualWidth = Math.max(56, Math.min(bayWidth, (length / spec.length) * bayWidth));
  const visualHeight = Math.max(44, Math.min(bayHeight, (width / spec.width) * bayHeight));
  cargo.style.width = `${visualWidth}px`;
  cargo.style.height = `${visualHeight}px`;
  cargo.textContent = `${length}×${width} м / ${weight} кг`;

  const fitsFloor = length <= spec.length && width <= spec.width;
  const fitsRotated = width <= spec.length && length <= spec.width;
  const fitsHeight = height <= spec.height;
  const fitsWeight = weight <= spec.weight;
  const fits = (fitsFloor || fitsRotated) && fitsHeight && fitsWeight;
  const areaShare = ((length * width) / (spec.length * spec.width)) * 100;

  if (fits && type === 'truck' && areaShare < 35) {
    setResult(result, `В фуре груз занимает примерно ${Math.max(1, Math.round(areaShare))}% пола. Похоже, есть смысл искать догруз, чтобы не платить за всю машину.`, 'is-good');
  } else if (fits && type === 'gazelle') {
    setResult(result, 'По габаритам и весу груз похож на задачу для газели или малотоннажного транспорта. Догрузыч уточнит погрузку и сроки.', 'is-good');
  } else if (fits) {
    setResult(result, 'Груз помещается. Нужно уточнить упаковку, погрузку и маршрут, чтобы подобрать выгодный формат.', 'is-good');
  } else {
    const reasons = [];
    if (!fitsHeight) reasons.push('высота');
    if (!fitsWeight) reasons.push('вес');
    if (!fitsFloor && !fitsRotated) reasons.push('длина/ширина');
    setResult(result, `В этот вариант не проходит: ${reasons.join(', ')}. Догрузыч подберет другой транспорт.`, 'is-bad');
  }
}

function updateRoute() {
  document.getElementById('routeA').textContent = fields.fromCity.value || 'Точка А';
  document.getElementById('routeB').textContent = fields.toCity.value || 'Точка Б';
}

function updateLeadText() {
  const text = `Маршрут: ${fields.fromCity.value || 'точка А'} → ${fields.toCity.value || 'точка Б'}\nГруз: ${fields.length.value || '?'}×${fields.width.value || '?'}×${fields.height.value || '?'} м, ${fields.weight.value || '?'} кг\nКомментарий: ${fields.comment.value || '—'}`;
  document.getElementById('leadMessage').value = text;
}

function updateAll() {
  updateRoute();
  updateTransport('truck');
  updateTransport('gazelle');
  updateLeadText();
}

document.querySelectorAll('.transport-tabs button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.transport-tabs button').forEach((item) => item.classList.remove('is-active'));
    document.querySelectorAll('.transport-card').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    document.getElementById(`${button.dataset.target}View`).classList.add('is-active');
  });
});

Object.values(fields).forEach((field) => field.addEventListener('input', updateAll));
document.getElementById('requestLink').addEventListener('click', updateLeadText);
window.addEventListener('resize', updateAll);
updateAll();
