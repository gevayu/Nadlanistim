// Israeli local number ("050-1234567") to the forms a link needs.
export const waNumber = (phone: string) => "972" + phone.replace(/\D/g, "").replace(/^0/, "");
export const telHref = (phone: string) => "tel:" + phone.replace(/[^\d+]/g, "");
