import React from 'react';
import { specimenMarkup } from './artwork/Repair02SpecimenSvg';
import styles from './Repair02.module.css';

// Markup contains only our own fixed SVG paths plus entity-escaped local catalog symbols.
export default function PoolArtwork({ pool }) {
  return <div className={styles['r02-art']} dangerouslySetInnerHTML={{ __html: specimenMarkup(pool) }} />;
}
