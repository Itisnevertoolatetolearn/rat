/// <reference path="../views/view.ts" />

class ProcessEvent implements Control.IncomingEvent {

	constructor(private table: HTMLTableElement) { }

	public emit(data) {
		data = data.split(",");
		let pid = data[0];
		let path = data[1];

		let row = this.table.insertRow(0);

		let pidCell = row.insertCell(0);
		pidCell.innerHTML = pid;

		let pathCell = row.insertCell(1);
		pathCell.innerHTML = path;

		row.onclick = () => {
			if (row.className === "") {
				row.className = "selected";
			} else {
				row.className = "";
			}
		}
	}
}
