/* SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (C) 2024 William
 */

'use strict';
'require dom';
'require fs';
'require poll';
'require rpc'
'require uci';
'require ui';
'require view';

var getStat = rpc.declare({
	object: 'luci.msd_lite',
	method: 'stat',
	expect: {  },
});

return view.extend({
	retrieveStatus: async function() {
		return uci.load('msd_lite').then(function() {
			var address = uci.get_first('msd_lite', 'instance', 'address');
			var enabled = uci.get_first('msd_lite', 'instance', 'enabled');
			var url = `http://${address[0]}/stat`

			if(enabled == 0) {
				return { value: 'msd lite is disabled.', rows:25 };
			}

			return fs.exec_direct('/usr/bin/wget', [ '-q', url, '-O', '-' ]).then(str => {
				return { value: str, rows: str.split(/\r\n|\r|\n/).length};
			});
		});
	},

	pollLog: async function() {
		const element = document.getElementById('status');
		if (element) {
			const status = await this.retrieveStatus();
			element.value = status.value;
			element.rows = status.rows;
		}
	},

	load: async function() {
		poll.add(this.pollLog.bind(this));
		return await this.retrieveStatus();
	},

	render: function(status) {
		return E([], [
			E('div', { 'id': 'content_status' }, [
				E('div', {'style': 'padding-bottom: 20px'}),
				E('textarea', {
					'id': 'status',
					'style': 'width: 100% !important; padding: 5px; font-family: monospace',
					'readonly': 'readonly',
					'wrap': 'off',
					'rows': status.rows,
				}, [ status.value ]),
				E('div', {'style': 'padding-bottom: 20px'})
			])
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
