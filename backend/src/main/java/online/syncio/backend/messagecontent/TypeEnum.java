package online.syncio.backend.messagecontent;

public enum TypeEnum {
    TEXT,
    STICKER,
    IMAGE;

    public static TypeEnum findByName (String name) {
        TypeEnum result = null;
        for (TypeEnum type : values()) {
            if (name.equalsIgnoreCase(type.name())) {
                result = type;
                break;
            }
        }
        return result;
    }
}
