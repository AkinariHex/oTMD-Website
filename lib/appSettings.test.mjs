import assert from 'node:assert/strict';
import test from 'node:test';
import { extractFonts, parseAppSettings } from './appSettings.js';

const style = (fontFamily = 'Nunito, Inter, sans-serif') => ({ backgroundColor: '8, 8, 20', backgroundOpacity: 0.8, borderRadius: 0, padding: 0, fontFamily });
const valid = () => ({
  displayer: { VisualizerStyle: '0px 0px 0px 0px', SmallDisplayer: false, TransparentBackground: true, MapsStyle: style() },
  ranked: { Health: style(), Maps: style('"Comic Sans MS", sans-serif'), Ratio: style() },
  app: { Layout: 'sidebar', PreviewBackground: 'checker', TextSize: 0, Animations: true, TrayBehavior: 'closeToTray' },
});

test('valid settings pass unchanged', () => {
  assert.deepEqual(parseAppSettings(valid()), valid());
});

test('secrets and unknown fields never survive', () => {
  const body = valid();
  body.apikey = 'SECRET';
  body.app.ExportMatches = { status: true, apikey: 'SECRET' };
  body.ranked.RoomID = '123';
  body.ranked.Health.extra = 'x';
  assert.ok(!JSON.stringify(parseAppSettings(body)).includes('SECRET'));
  assert.ok(!JSON.stringify(parseAppSettings(body)).includes('RoomID'));
  assert.ok(!JSON.stringify(parseAppSettings(body)).includes('extra'));
});

test('invalid values are refused', () => {
  const change = (mutate) => {
    const body = valid();
    mutate(body);
    return parseAppSettings(body);
  };
  assert.equal(change((body) => { body.ranked.Maps.fontFamily = 'x; background: url(evil)'; }), null);
  assert.equal(change((body) => { body.ranked.Maps.fontFamily = 'a'.repeat(129); }), null);
  assert.equal(change((body) => { body.ranked.Maps.backgroundOpacity = 2; }), null);
  assert.equal(change((body) => { body.ranked.Maps.backgroundColor = 'red'; }), null);
  assert.equal(change((body) => { body.app.TextSize = 500; }), null);
  assert.equal(change((body) => { body.app.Layout = 'other'; }), null);
  assert.equal(change((body) => { body.displayer.VisualizerStyle = 'url(evil)'; }), null);
  assert.equal(parseAppSettings(null), null);
  assert.equal(parseAppSettings([]), null);
});

test('fonts are the first family of each overlay, counted once', () => {
  assert.deepEqual(extractFonts(valid()).sort(), ['Comic Sans MS', 'Nunito']);
});

test('generic families are not fonts', () => {
  const body = valid();
  for (const entry of [body.displayer.MapsStyle, body.ranked.Health, body.ranked.Maps, body.ranked.Ratio]) entry.fontFamily = 'sans-serif';
  assert.deepEqual(extractFonts(body), []);
});
