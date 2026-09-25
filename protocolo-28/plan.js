(function (w) {
  function txt(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function purposeKind(purpose) {
    var t = txt(purpose);
    if (/dinero|abundan|negocio|venta|cobr|riquez/.test(t)) return 'dinero';
    if (/amor|pareja|atracc|relacion|ex /.test(t)) return 'amor';
    if (/paz|ansied|calma|estres|miedo/.test(t)) return 'paz';
    if (/cuerpo|peso|salud|energi|vital/.test(t)) return 'cuerpo';
    if (/foco|claridad|estudio|trabajo|mente/.test(t)) return 'foco';
    if (/yo |identidad|confianz|amor propio|merec/.test(t)) return 'identidad';
    return 'general';
  }

  function roleOf(title, i, kind) {
    var t = txt(title);
    if (/money|abundan|dinero/.test(t)) return 'canal';
    if (/booster|limpia|limitless|master mind/.test(t)) return 'limpia';
    if (/imagine|identity|identidad/.test(t)) return 'soy';
    if (/seduc|magic|amor/.test(t)) return 'imán';
    if (/keep cool|paz|cool/.test(t)) return 'calma';
    if (/vita|fit|eclat/.test(t)) return 'cuerpo';
    if (i === 0) return kind === 'dinero' ? 'canal' : 'base';
    if (i === 1) return 'limpia';
    if (i === 2) return 'soy';
    return 'extra';
  }

  function hoursFor(role, kind) {
    if (role === 'canal' || role === 'base' || role === 'imán') {
      return { when: 'Noche · loop (bocina bajito)', days: 'Todos los días' };
    }
    if (role === 'limpia') {
      return { when: 'Día · audífonos, bloque 1', days: kind === 'paz' ? 'Todos los días' : 'Lun, mié, vie' };
    }
    if (role === 'soy') {
      return { when: 'Atardecer o al despertar, 30–45 min', days: 'Mar, jue, sáb' };
    }
    if (role === 'calma') {
      return { when: 'Cuando el loop viejo grita', days: 'Si hace falta, y domingo' };
    }
    if (role === 'cuerpo') {
      return { when: 'Mientras caminas o te mueves', days: 'Lun a vie' };
    }
    return { when: 'Día · segundo bloque', days: 'Fines de semana' };
  }

  function onlyThese(n) {
    if (n === 0) return 'Mete los audios que te asignó Erior. El plan se arma solo con esos.';
    if (n === 1) return 'Usa solo este. Noche en loop. Día, mínimo 4 horas. No mezcles otros.';
    if (n === 2) return 'Solo estos dos. Uno de noche, otro de día. No los pongas al mismo tiempo.';
    return 'Solo los que te asignaron. El primero ancla de noche. Los demás rotan de día.';
  }

  function build(purpose, tracks) {
    var list = (tracks || []).slice();
    var kind = purposeKind(purpose);
    var n = list.length;
    var rows = list.map(function (t, i) {
      var role = roleOf(t.title, i, kind);
      var h = hoursFor(role, kind);
      return {
        title: t.title,
        role: role,
        when: h.when,
        days: h.days
      };
    });
    var summary = '';
    if (!purpose) summary = 'Sella tu propósito de los 28 días. Una sola vez.';
    else if (n === 0) summary = 'Propósito sellado. Mete los audios que te asignaron y te armo las horas.';
    else if (n === 1) summary = 'Con tu audio asignado: ancla de noche y 4 horas de día. Ese es el plan.';
    else if (n === 2) summary = 'Dos asignados: noche = lo que quieres. Día = lo que lo sabotea.';
    else if (n === 3) summary = 'Tres asignados: noche = deseo, día = limpieza, atardecer = el yo que ya lo tiene.';
    else summary = n + ' audios asignados. El primero es noche. Los demás rotan de día. No todos a la vez.';

    return {
      purpose: String(purpose || '').trim(),
      kind: kind,
      summary: summary,
      rows: rows,
      extra: onlyThese(n)
    };
  }

  w.P28Plan = { build: build, purposeKind: purposeKind };
})(window);
