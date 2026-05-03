'use client';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

function markdownToHTML(description) {
  return DOMPurify.sanitize(marked.parse(description));
}

export default function TournamentDescription({ description }) {
  return (
    <div
      name="description"
      dangerouslySetInnerHTML={{ __html: markdownToHTML(description) }}
    ></div>
  );
}
