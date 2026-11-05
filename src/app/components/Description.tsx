import { motion } from 'motion/react';
import { useState } from 'react';

const font = '"aktiv-grotesk-condensed", sans-serif';

/** Au-delà de cette longueur, le texte est replié avec un bouton « Voir plus ». */
const COLLAPSE_AFTER_CHARS = 600;
const PREVIEW_LINES = 3;

export function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split('\n');
  const collapsible = text.length > COLLAPSE_AFTER_CHARS && lines.length > PREVIEW_LINES;
  const shown = collapsible && !expanded ? lines.slice(0, PREVIEW_LINES).join('\n') : text;

  return (
    <div className="mb-12">
      <p
        className="text-base leading-relaxed whitespace-pre-line"
        style={{ fontFamily: font, fontWeight: 400 }}
      >
        {shown}
        {collapsible && !expanded && (
          <motion.button
            onClick={() => setExpanded(true)}
            className="ml-2 text-black underline hover:no-underline"
            style={{ fontFamily: font, fontWeight: 700 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Voir plus
          </motion.button>
        )}
      </p>
      {collapsible && expanded && (
        <motion.button
          onClick={() => setExpanded(false)}
          className="mt-2 text-black underline hover:no-underline"
          style={{ fontFamily: font, fontWeight: 700 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Voir moins
        </motion.button>
      )}
    </div>
  );
}
