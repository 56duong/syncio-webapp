package online.syncio.backend.setting;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Table(name = "settings")
@NoArgsConstructor
@Getter
@Setter
public class Setting implements Serializable {

    @Id
    @Column(nullable = false, length = 128)
    private String settingKey;

    @Column(nullable = false, length = 1024)
    private String settingValue;

    @Enumerated(EnumType.STRING)
    @Column(length = 100, nullable = false)
    private SettingCategory category;
    public Setting (String settingKey) {
        this.settingKey = settingKey;
    }


    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((settingKey == null) ? 0 : settingKey.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Setting other = (Setting) obj;
        if (settingKey == null) {
            if (other.settingKey != null)
                return false;
        } else if (!settingKey.equals(other.settingKey))
            return false;
        return true;
    }

}