import {
  type MRT_BandCell,
  type MRT_BandFormat,
  type MRT_RowData,
} from '../types';

export const bandLockedColumnSize = (columnId: string, size: number) =>
  columnId === 'mrt-row-select' || columnId === 'mrt-row-numbers' ? size : 0;

const isDisplayColumn = (column: unknown) =>
  (column as { columnDef?: { columnDefType?: string } }).columnDef
    ?.columnDefType === 'display';

export const groupBandCells = <TData extends MRT_RowData>(
  format: MRT_BandFormat<TData>,
): MRT_BandCell<TData>[][] => {
  const grouped: MRT_BandCell<TData>[][] = Array.from(
    { length: format.rows },
    () => [],
  );

  for (const cell of format.cells) {
    if (cell.row < 0 || cell.row >= format.rows) continue;
    grouped[cell.row].push(cell);
  }

  for (const row of grouped) {
    row.sort((left, right) => left.col - right.col);
  }

  return grouped;
};

export const splitLeafColumns = <TColumn>(columns: TColumn[]) => {
  const dataIndexes = columns
    .map((column, index) => (isDisplayColumn(column) ? -1 : index))
    .filter((index) => index >= 0);

  if (!dataIndexes.length) {
    return {
      dataColumns: [] as TColumn[],
      leading: columns,
      trailing: [] as TColumn[],
    };
  }

  const first = dataIndexes[0];
  const last = dataIndexes[dataIndexes.length - 1];
  const middle = columns.slice(first, last + 1).filter(isDisplayColumn);

  return {
    dataColumns: columns.filter((column) => !isDisplayColumn(column)),
    leading: columns.slice(0, first),
    trailing: [...middle, ...columns.slice(last + 1)],
  };
};

export const getRecordValue = (
  record: unknown,
  path: string | undefined,
): unknown => {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((current, key) => {
    if (current == null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, record);
};
