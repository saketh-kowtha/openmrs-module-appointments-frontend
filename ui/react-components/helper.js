import {DEFAULT_MAX_APPOINTMENT_PROVIDERS, minDurationForAppointment, PROVIDER_RESPONSES} from "./constants";
import moment from "moment";

export const isSpecialitiesEnabled = appConfig => {
    if (appConfig)
        return appConfig.enableSpecialities;
    return false;
};

export const getDefaultOccurrences = appConfig => {
    if (appConfig && appConfig.recurrence)
        return Number(appConfig.recurrence.defaultNumberOfOccurrences);
};

export const maxAppointmentProvidersAllowed = appConfig => {
    if (appConfig && appConfig.maxAppointmentProviders)
        return appConfig.maxAppointmentProviders;
    return DEFAULT_MAX_APPOINTMENT_PROVIDERS;
};

export const getDuration = (service, serviceType) => (serviceType && serviceType.duration)
    || (service && service.durationMins)
    || minDurationForAppointment;

export const getYesterday = () => {
    return moment().subtract('1', 'days').endOf('day');
};

export const isServiceTypeEnabled = appConfig => {
    return appConfig && appConfig.enableServiceTypes;
};

export const getValidProviders = providers => {
    return providers && providers.filter(provider => provider.response === PROVIDER_RESPONSES.ACCEPTED);
};

export const searchFeildOnChangeHandler=(state,setState,selectedState,setSelectedState,e)=>{
    setSelectedState([
        ...selectedState,
        e
      ]);
      setState(() =>
        [...state].filter(item => item != e)
      );
}

export const searchFeildOnRemoveHandler=(state,setState,selectedState,setSelectedState,e)=>{
    setSelectedState(() =>
      [...selectedState].filter(item => item.value !== e)
    );
    setState([
      ...state,
      { value: e, label: e }
    ]);
}
