import { utcToZonedTime } from 'date-fns-tz';
import { formatDistanceToNowStrict } from 'date-fns';

export function dayDiff(conditionArray, roundName, optionName, dateNameFrom = null, dateNameTo = null) {
  const timeZone = 'Asia/Bangkok';
  const now = new Date();

  const round = conditionArray.case.find((r) => r.name === roundName);
  if (!round) {
    return { status: 'error', message: 'Round not found' };
  }

  const option = round.option[optionName];
  if (!option) {
    return { status: 'error', message: 'Option not found' };
  }

  if (!dateNameFrom) {
    return { status: 'never', message: 'No expire' };
  }

  const dateFromStr = option.dates[dateNameFrom];
  if (!dateFromStr) {
    return { status: 'error', message: 'Invalid dateFrom' };
  }

  const dateFrom = utcToZonedTime(new Date(dateFromStr), timeZone);
  const nowInBangkok = utcToZonedTime(now, timeZone);

  if (dateNameTo) {
    const dateToStr = option.dates[dateNameTo];
    if (!dateToStr) {
      return { status: 'error', message: 'Invalid dateTo' };
    }
    const dateTo = utcToZonedTime(new Date(dateToStr), timeZone);

    if (nowInBangkok < dateFrom) {
      const duration = formatDistanceToNowStrict(dateFrom, { addSuffix: true });
      return {
        status: 'not-due',
        message: `Starts in ${duration}`,
      };
    } else if (nowInBangkok >= dateFrom && nowInBangkok <= dateTo) {
      const duration = formatDistanceToNowStrict(dateTo, { addSuffix: true });
      return {
        status: 'in-due',
        message: `Ends in ${duration}`,
      };
    } else {
      const duration = formatDistanceToNowStrict(dateTo, { addSuffix: true });
      return {
        status: 'pass-due',
        message: `Ended ${duration}`,
      };
    }
  } else {
    if (nowInBangkok < dateFrom) {
      const duration = formatDistanceToNowStrict(dateFrom, { addSuffix: true });
      return {
        status: 'not-due',
        message: `Starts in ${duration}`,
      };
    } else {
      const duration = formatDistanceToNowStrict(dateFrom, { addSuffix: true });
      return {
        status: 'pass-due',
        message: `Ended ${duration}`,
      };
    }
  }
}

export function getData(conditionArray, roundName, optionName = null, dateNameFrom = null) {
  const round = conditionArray.case.find((r) => r.name === roundName);
  if (!round) {
    return { status: 'error', message: 'Round not found' };
  }

  if (!optionName) {
    return { status: 'success', data: round };
  }

  const option = round.option[optionName];
  if (!option) {
    return { status: 'error', message: 'Option not found' };
  }

  if (!dateNameFrom) {
    return { status: 'success', data: option };
  }

  const dateFrom = option.dates[dateNameFrom];
  if (dateFrom === undefined) {
    return { status: 'error', message: 'Invalid dateFrom' };
  }

  return {
    status: 'success',
    data: { [dateNameFrom]: dateFrom },
  };
}
