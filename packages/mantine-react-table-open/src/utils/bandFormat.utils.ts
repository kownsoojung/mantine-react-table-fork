import {
  type MRT_BandCell,
  type MRT_BandFormat,
  type MRT_BandValidation,
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

const isEmptyBandValue = (value: unknown) =>
  value == null ||
  value === '' ||
  value === false ||
  (Array.isArray(value) && value.length === 0);

export const getBandValidationError = <TData extends MRT_RowData>(
  validation: MRT_BandValidation<TData> | undefined,
  value: unknown,
  record: TData,
): string | undefined => {
  if (!validation) return undefined;
  const fallback = validation.message;

  if (validation.required && isEmptyBandValue(value)) {
    return typeof validation.required === 'string'
      ? validation.required
      : fallback || '필수입력값입니다';
  }

  if (isEmptyBandValue(value)) return undefined;

  if (validation.minLength != null || validation.maxLength != null) {
    const length = String(value).length;
    if (validation.minLength != null && length < validation.minLength) {
      return fallback || `${validation.minLength}자 이상 입력하세요`;
    }
    if (validation.maxLength != null && length > validation.maxLength) {
      return fallback || `${validation.maxLength}자 이하로 입력하세요`;
    }
  }

  if (validation.min != null || validation.max != null) {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numeric)) return fallback || '숫자를 입력하세요';
    const belowMin = validation.min != null && numeric < validation.min;
    const aboveMax = validation.max != null && numeric > validation.max;
    if (belowMin || aboveMax) {
      if (fallback) return fallback;
      if (validation.min != null && validation.max != null) {
        return `${validation.min} 이상 ${validation.max} 이하로 입력하세요`;
      }
      if (belowMin) return `${validation.min} 이상 입력하세요`;
      return `${validation.max} 이하로 입력하세요`;
    }
  }

  if (validation.pattern) {
    try {
      if (!new RegExp(validation.pattern).test(String(value))) {
        return fallback || '형식이 올바르지 않습니다';
      }
    } catch {
      return fallback || '형식이 올바르지 않습니다';
    }
  }

  if (validation.validate) {
    const result = validation.validate(value, record);
    if (typeof result === 'string' && result) return result;
    if (result === false) return fallback || '올바른 값이 아닙니다';
  }

  return undefined;
};
