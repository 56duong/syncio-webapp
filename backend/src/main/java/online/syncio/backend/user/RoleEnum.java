package online.syncio.backend.user;

public enum RoleEnum {
    ADMIN,
    USER;

    public static RoleEnum findByName (String name) {
        RoleEnum result = null;
        for (RoleEnum role : values()) {
            if (name.equalsIgnoreCase(role.name())) {
                result = role;
                break;
            }
        }
        return result;
    }
}
