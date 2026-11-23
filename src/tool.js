/*! Eretek Online Araçlar #01 — IPv4 Subnet Hesaplayıcı */
ERT.def('01', {
	run: function (v, c) {
		var I = ERT.ip, s = v.addr.trim();
		if (s.indexOf('/') === -1 && s.indexOf(' ') === -1) {
			if (!v.mask) { throw c.fe('mask', 'needMask'); }
			s += (/^\/?\d{1,2}$/.test(v.mask.trim()) ? '/' + v.mask.trim().replace('/', '') : ' ' + v.mask.trim());
		}
		var p = I.parseCidr(s);
		if (p.err) { throw c.fe(p.err === 'addr' ? 'addr' : (v.mask ? 'mask' : 'addr'), p.err === 'mask' ? 'badMask' : (p.err === 'len' ? 'badLen' : 'badIp')); }
		if (p.fam !== 4) { throw c.fe('addr', 'v6'); }
		var len = p.len, total = Math.pow(2, 32 - len), first, last, hosts, bc = null, note;
		if (len === 32) { first = last = p.net; hosts = 1; note = c.t('n32'); }
		else if (len === 31) { first = p.net; last = p.last; hosts = 2; note = c.t('n31'); }
		else { first = p.net + 1n; last = p.last - 1n; hosts = total - 2; bc = p.last; }
		var mask = I.lenMask4(len), wc = I.fmt4(I.hostMask(4, len));
		var a = Number(p.addr), scope = (a >>> 24 === 10 || (a >>> 20) === 0xAC1 || (a >>> 16) === 0xC0A8) ? 'priv' : (a >>> 22 === 0x191 ? 'cgn' : (a >>> 24 === 127 ? 'lo' : ((a >>> 16) === 0xA9FE ? 'll' : ((a >>> 28) === 14 ? 'mc' : (((a >>> 8) === 0xC00002 || (a >>> 8) === 0xC63364 || (a >>> 8) === 0xCB0071) ? 'doc' : 'pub')))));
		var binMask = Array.from({ length: 4 }, function (_, i) { return ('00000000' + ((Number(I.parse4(mask)) >>> (24 - i * 8)) & 255).toString(2)).slice(-8); }).join('.');
		var out = {
			big: I.fmt4(p.net) + '/' + len,
			kv: [[c.t('net'), I.fmt4(p.net)], [c.t('bc'), bc === null ? c.t('noBc') : I.fmt4(bc)], [c.t('mask'), mask + ' (/' + len + ')'], [c.t('wc'), wc],
				[c.t('range'), I.fmt4(first) + ' – ' + I.fmt4(last)], [c.t('total'), c.n(total, 0)], [c.t('hosts'), c.n(hosts, 0)], [c.t('scope'), c.t('sc_' + scope)], [c.t('bin'), binMask]],
			msgs: [],
			v: { net: I.fmt4(p.net), bc: bc === null ? null : I.fmt4(bc), hosts: hosts, total: total, first: I.fmt4(first), last: I.fmt4(last), mask: mask, wc: wc, scope: scope }
		};
		if (note) { out.msgs.push(['info', note]); }
		if (p.addr !== p.net && len < 31) { out.msgs.push(['info', c.t('hostIn', { a: I.fmt4(p.addr), n: I.fmt4(p.net) + '/' + len })]); }
		out.x = { copy: out.kv.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') };
		return out;
	}
});
