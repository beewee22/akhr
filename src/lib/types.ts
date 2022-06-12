export interface CardPosition {
	x: number;
	y: number;
	width: number;
	height: number;
	originSrc: string;
}

export class CardPositionClass implements CardPosition {
	x: number;
	y: number;
	width: number;
	height: number;
	originSrc: string;
  rowIndex: number;
  columnIndex: number;

	constructor(x: number, y: number, width: number, height: number, originSrc: string, rowIndex: number, columnIndex: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.originSrc = originSrc;
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
	}

	toString() {
		const { x, y, width, height, originSrc, rowIndex, columnIndex } = this;
		const value = { x, y, width, height, originSrc, rowIndex, columnIndex };
		return JSON.stringify(value);
	}
}
