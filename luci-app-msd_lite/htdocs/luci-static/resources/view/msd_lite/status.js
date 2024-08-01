/* SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (C) 2024 William
 */

'use strict';
'require dom';
'require fs';
'require poll';
'require rpc'
'require ui';
'require view';

var getStat = rpc.declare({
	object: 'luci.msd_lite',
	method: 'stat',
	expect: {  },
});

return view.extend({
	load: function() {
		return Promise.all([
			getStat(),
		]);
	},

	pollData: function (container) {
		poll.add(L.bind(function () {
			return this.load().then(L.bind(function (data) {
				dom.content(container, this.renderContent(data));
			}, this));
		}, this));
	},

	renderContent: function (results) {
		var table = E('table', { 'class': 'table cbi-section-table', 'id': 'stat' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th' }, _('Thread')),
				E('th', { 'class': 'th' }, _('Clients Count')),
				E('th', { 'class': 'th' }, _('Rate In(mbps)')),
				E('th', { 'class': 'th' }, _('Rate Out(mbps)'))
			])
		]);

		var clients = Array.isArray(results[0].clients) ? results[0].clients : [];
		var ratein = Array.isArray(results[0].ratein) ? results[0].ratein : [];
		var rateout = Array.isArray(results[0].rateout) ? results[0].rateout : [];
		
		let rows=new Array();
		clients.forEach((c, i) => {
			let row = [i, clients[i], ratein[i], rateout[i]];
			rows.push(row.map(e => String(e)));
		})

		cbi_update_table(table, rows, E('em', _('MSD_Lite is not running.')));

		return table;
	},

	render: function(results) {
		var content = E([], [
			E('h2', {class: 'content'}, _('Multi Stream daemon Lite')),
			E('div', {class: 'cbi-map-descr'}, _('The lightweight version of Multi Stream daemon (msd) Program for organizing IP TV streaming on the network via HTTP.')),
			E('div')
		]);
		var container = content.lastElementChild;

		dom.content(container, this.renderContent(results));
		this.pollData(container);

		return content;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
