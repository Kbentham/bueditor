// $Id$
//collection of functions required for editor default buttons.

//enclose each line in the given text with the given tags.
function eDefProcessLines(text, tagA, tagB) {
  return tagA+ text.replace(/(\r?\n)/g, tagB+'$1'+tagA) +tagB;
}
//enclose lines in the selected text with inA and inB and then enclose the resulting text with outA and outB.
function eDefSelProcessLines(outA, inA, inB, outB) {
  var E = editor.active, sel = E.getSelection();
  if (sel) E.replaceSelection(outA+eDefProcessLines(sel, inA, inB)+outB, 'end');
  else E.tagSelection(outA+inA, inB+outB);
}
//returns form input html. atxt contains additional attributes
function eDefHtmlInput(type, name, value, size, atxt) {
  return '<input type="'+ type +'" name="'+ (name||'') +'" value="'+ (value||'') +'" size="'+ (size||'') +'" '+ (atxt||'') +' />';
}
function eDefHtmlInputT(name, value, size, atxt) {
  return eDefHtmlInput('text', name, value, size, eDefTxtClass(atxt, 'form-item'));
}
function eDefHtmlInputB(name, value, size, atxt) {
  return eDefHtmlInput('button', name, value, size, eDefTxtClass(atxt, 'form-submit'));
}
function eDefTxtClass(txt, c) {
  var txt = txt||'';
  if (txt && txt.indexOf('class="')!=-1) return txt.replace(/(class\=\")/, '$1'+c+' ');
  return txt+' class="'+c+'"';
}

//return a table row containing the attribute list as cell. eDefHtmlRow(cell1, cell2 ...), cell = [content, attributes]
function eDefHtmlRow() {
  var a, cells = '';
  for (var i=0; a=arguments[i]; i++) cells += eDefHtmlCell(a[0], a[1]);
  return '<tr>'+ cells +'</tr>';
}
// return a table cell containing the given value and having the given attributes
function eDefHtmlCell(value, atxt) {
  return '<td'+ (atxt||'')+'>'+ (value||'') +'</td>';
}

//Previews the selected text in the textarea. If there is no selection, previews the whole content.
function eDefPreview() {
  var P, E = editor.active, T = E.textArea, B = E.buttons[E.bindex];
  if (E.preview) {
    P = E.preview;
  }
  else {
    P = document.createElement('div');
    P.className = 'preview';
    P.style.display = 'none';
    P.style.overflow = 'auto';
    T.parentNode.insertBefore(P, T);
    E.preview = P;
  }
  if (P.style.display == 'none') {
    var S = E.getSelection();
    if (editor.mode != 2) editor.G['pos'+T.id] = E.posSelection();
    P.style.display = 'block';
    P.style.height = T.style.height||(T.offsetHeight+'px');
    P.style.width = T.style.width||(T.offsetWidth+'px');
    P.innerHTML = '<div class="node"><div class="content">'+ (S ? S : T.value) +'</div></div>';
    T.style.display = 'none';
    addClass(B, 'stay-clicked');
    E.buttonsDisabled(true, E.bindex);
  }
  else {
    removeClass(B, 'stay-clicked');
    E.buttonsDisabled(false);
    P.innerHTML = '';
    P.style.display = 'none';
    T.style.display = 'block';
    if (editor.mode!=2) E.makeSelection(editor.G['pos'+T.id].start, editor.G['pos'+T.id].end);
  }
}

//Insert the data in the given form to the textarea. Link and image dialogs use this function.
function eDefFileInsert(form, type) {
  var el = form.elements, E = editor.active;
  var o = editor.G.selObj||{attributes : []};
  editor.dialog.close();
  if (type == 'image') {
    var def = ['src', 'width', 'height', 'alt'];
    var img = '<img';
    for(var i in def) o.attributes[def[i]] = el[def[i]].value;
    for(var i in o.attributes) img += ' '+ i +'="'+ o.attributes[i] +'"';
    img += ' />';
    E.replaceSelection(img);
  }
  else if (type == 'link') {
    var a = '<a';
    var def = ['href', 'title'];
    for(var i in def) o.attributes[def[i]] = el[def[i]].value;
    for(var i in o.attributes) if (o.attributes[i]) a += ' '+ i +'="'+ o.attributes[i] +'"';
    a += '>';
    editor.G.selObj ? E.replaceSelection(a + o.innerHTML +'</a>') : E.tagSelection(a, '</a>');
  }
  editor.G.selObj = null;
}

//Open file insertion dialog of the given type. L containes translated interface text. brwURL is URL of the file browser
function eDefFileDialog(type, L, brwURL) {
  var brwButton = brwURL ? eDefHtmlInput('button', 'brw', L.brw, '', 'class="file-browser" onclick="eDefFileBrowser(\''+ brwURL +'\', \''+ type +'\', this.form)"') : '';
  var content = '<form name="eDialogForm" onsubmit="eDefFileInsert(this, \''+ type +'\'); return false;"><div class="form-item"><table>';
  if (type == 'image') {
    editor.G.selObj = editor.parseTag(editor.active.getSelection(), 'img');
    var i = editor.G.selObj ? editor.G.selObj.attributes : {};
    content += eDefHtmlRow([L.url], [eDefHtmlInputT('src', i.src, 25)+' '+brwButton]);
    content += eDefHtmlRow([L.w+' x '+L.h], [eDefHtmlInputT('width', i.width, 3)+' x '+eDefHtmlInputT('height', i.height, 3)]);
    content += eDefHtmlRow([L.alt], [eDefHtmlInputT('alt', i.alt, 25)]);
  }
  else if (type == 'link') {
    editor.G.selObj = editor.parseTag(editor.active.getSelection(), 'a');
    var a = editor.G.selObj ? editor.G.selObj.attributes : {};
    content += eDefHtmlRow([L.url], [eDefHtmlInputT('href', a.href, 25)+' '+brwButton]);
    content += eDefHtmlRow([L.tt], [eDefHtmlInputT('title', a.title, 25)]);
  }
  content += '</table><div>'+ eDefHtmlInput('submit', 'ok', L.ok, '') +'</div></div></form>';
  editor.dialog.open(L.title, content);
}

//open the file browser of the given type using the given URL.
function eDefFileBrowser(brwURL, type, form) {
  var fields = {image : 'src', link : 'href'};
  eDefImceUrl = form ? form.elements[fields[type]].value : '';
  window.open(brwURL, 'eDef', 'width=640, height=480, resizable=1');
}

//IMCE custom URL and custom finishing function. IMCE js API.
var eDefImceUrl = '';
function eDefImceFinish(url, width, height, fsize, win) {
  var el = document.forms['eDialogForm'].elements;
  if (el['src']) {
    el['src'].value = url;
    el['width'].value = width;
    el['height'].value = height;
  }
  else if (el['href']) {
    el['href'].value = url;
  }
  win.close();
}

//Display help text(button title) for each button of the editor.
function eDefHelp() {
  var b, E = editor.active;
  if (typeof editor.G.help == 'undefined') {
    editor.G.help = '<table style="width: 400px">';
    for (var i=0; b=E.buttons[i]; i++) {
      editor.G.help += '<tr><td><input type="'+b.type+'" class="'+b.className+'"'+(b.src?'src="'+b.src+'"' : 'value="'+b.value+'"')+' /></td><td>'+b.title+'</td></tr>';
    }
    editor.G.help += '</table>';
  }
  editor.dialog.open(editor.buttons[E.bindex][0], editor.G.help);
}
