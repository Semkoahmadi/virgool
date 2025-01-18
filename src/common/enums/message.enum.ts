export enum BadRequestMessage {
    InValidLoginData = "!..اطلاعات ارسال شده برای ورود درست نیست",
    InValidRegisterData = "!..اطلاعات ارسال شده برای ثبت نام درست نیست",
    SomeThingWrong = "مشکل دااری",
    InvalidCategories = "دسته بندی ها را به درستی وارد نمااید",
    AlreadyAccepted = "نظرت قبلا تااید شدده",
    AlreadyRejected= "نظر قبلا رد شده",
}
export enum AuthMessage {
    NotFoundAccount = "حساب کاربری پیدا نشدد",
    TryAgain = "!..دوباره سعی کن شاید شد",
    AlreadyExistAccount = "حساب کاربری قبلا وجود دارد",
    ExpiredCode="کد تاایید باطل شده دوباره درخواست بده",
    LoginAgain="مجددا بیا تو",
    LoginIsRequired="!!باید بیای تو",
    Blocked = "حساب کاربری شما مسدود شده  زنگ بزن درستش کنن"
}
export enum NotFoundMessage {
    NotFound = "موردی یافت نشد",
    NotFoundCategory = "دسته بندی یافت نشد",
    NotFoundPost = "مقاله ای یافت نشد",
    NotFoundUser = "کاربری پیدا  نشد",
}
export enum ValidationMessage {
    InvalidImageFormat = "فرمت رو درست انتخاب کن",
    InvalidEmailFormat = "ایمیل درس نیس..",
    InvalidPhoneFormat = "شماره موبایل درس نیست",
}
export enum PublicMessage {
    SentOtp = "کد یکبار مصرف با موفقیت ارسال شد",
    LoggedIn = "با موفقیت اومدی توو",
    Created = "با موفقیت ایجاد شد",
    Deleted = "با موفقیت حذف شد",
    Updated = "با موفقیت به روز رسانی شد",
    Inserted = "با موفقیت درج شد",
    Like = "مقاله با موفقیت لایک شد",
    DisLike = "لایک شما برداشته شد",
    Bookmark = "مقاله با موفقیت ذخیره شد",
    UnBookmark = " مقاله از لیست مقالات ذخیره شده برداشته شد",
    CreatedComment = " نظر شما با موفقیت ثبت شد",
    Followed = "با موفقیت دنبال شد",
    UnFollow = "از لیست دنبال شوندگان حذف شد",
    Blocked = "حساب کاربری با موفقیت مسدود شد",
    UnBlocked = "حساب کاربری از حالت مسدود خارج شد",
}
export enum ConflictMessage {
    CategoryTitle = "عنوان دسته بندی قبلا ثبت شده است",
    Email = "در حال حاضر این ایمیل توسط شخص دیگری استفاده میشه",
    Phone = "در حال حاضر این شماره توسط شخص دیگری استفاده میشه",
    Username = "در حال حاضر این نام توسط شخص دیگری استفاده میشه",
}