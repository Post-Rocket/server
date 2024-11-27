const emptyString = () => '',
  getStyle = s => (console.getStyle || emptyString)(s);

const formatLogMsg = (where, text, prefix = '', color = 'white', _color = getStyle(color)) => (
	`${getStyle('reset')}${getStyle('bright')}${_color}${prefix}${where && (` ${prefix && 'i' || 'I'}n ` + where) || ''}${(prefix || where) && ': ' || ''}${getStyle('reset')}${_color}${text}${getStyle('reset')}`
);

// Exports.
formatLogMsg.errMsg = (where, text) => formatLogMsg(where, text, '\n⛔️ ERROR', 'red');
formatLogMsg.warningMsg = (where, text) => formatLogMsg(where, text, '\n⚠️  WARNING', 'yellow');
formatLogMsg.infoMsg = (where, text) => formatLogMsg(where, text, 'ℹ️ INFO', 'cyan');
formatLogMsg.successMsg = (where, text) => formatLogMsg(where, text, '✅ SUCCESS', 'green');
formatLogMsg.msg = (where, text) => formatLogMsg(where, text, '', 'white');

module.exports = Object.freeze(Object.defineProperty(formatLogMsg, 'formatLogMsg', {
  value: formatLogMsg
}));