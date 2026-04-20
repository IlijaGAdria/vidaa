import state from "../state.js";

// ================================================
// Channel grid 2D navigation (home screen cards)
// Grid: 2 rows, N columns
// ================================================

export function getCardAt(row, col) {
  var idx = col * 2 + row;
  return state.allCards[idx] || null;
}

export function getTotalCols() {
  return Math.ceil(state.allCards.length / 2);
}

export function clearChannelFocus() {
  var card = getCardAt(state.rowIndex, state.colIndex);
  if (card) card.classList.remove("active");
}

export function setChannelFocus() {
  var card = getCardAt(state.rowIndex, state.colIndex);
  if (card) card.classList.add("active");
  scrollGrid();
}

function scrollGrid() {
  var leftCol = Math.max(0, state.colIndex - 1);
  var refCard = getCardAt(0, leftCol);
  if (refCard && state.channelWrapper) {
    state.channelWrapper.style.transform = "translateX(" + (-refCard.offsetLeft) + "px)";
  }
}

export function moveChannelCol(direction) {
  var totalCols = getTotalCols();
  var newCol = state.colIndex + direction;
  if (newCol < 0 || newCol >= totalCols) return;
  if (!getCardAt(state.rowIndex, newCol)) return;
  clearChannelFocus();
  state.colIndex = newCol;
  setChannelFocus();
}

export function moveChannelRow(direction) {
  var newRow = state.rowIndex + direction;
  if (newRow < 0 || newRow > 1) return;
  if (!getCardAt(newRow, state.colIndex)) return;
  clearChannelFocus();
  state.rowIndex = newRow;
  setChannelFocus();
}
