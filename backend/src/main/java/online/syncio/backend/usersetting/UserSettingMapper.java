package online.syncio.backend.usersetting;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserProfile;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userclosefriend.UserCloseFriendRepository;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserSettingMapper {

    private final AuthUtils authUtils;
    private final UserRepository userRepository;
    private final UserCloseFriendRepository userCloseFriendRepository;
    private final UserFollowRepository userFollowRepository;

    public UserProfile mapToUserProfile (final UserSetting userSetting, final UserProfile userProfile) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if(currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
            boolean isCloseFriend = userCloseFriendRepository.existsByTargetIdAndActorId(userSetting.getUser().getId(), currentUserId);
            userProfile.setCloseFriend(isCloseFriend);
            boolean isFollowing = userFollowRepository.existsByTargetIdAndActorId(userSetting.getUser().getId(), currentUserId);
            userProfile.setFollowing(isFollowing);
        }

        final User user = userSetting.getUser();

        userProfile.setId(user.getId());
        userProfile.setUsername(user.getUsername());
        userProfile.setBio(user.getBio());
        userProfile.setFollowerCount(user.getFollowers().size());
        userProfile.setFollowingCount(user.getFollowing().size());

        return userProfile;
    }


    public UserSettingDTO mapToDTO (final UserSetting userSetting, final UserSettingDTO userSettingDTO) {
        userSettingDTO.setId(userSetting.getId());
        userSettingDTO.setFindableByImageUrl(userSetting.getFindableByImageUrl());
        userSettingDTO.setWhoCanAddYouToGroupChat(userSetting.getWhoCanAddYouToGroupChat());
        userSettingDTO.setWhoCanSendYouNewMessage(userSetting.getWhoCanSendYouNewMessage());
        userSettingDTO.setUserId(userSetting.getUser().getId());
        return userSettingDTO;
    }


    public UserSetting mapToEntity (final UserSettingDTO userSettingDTO, final UserSetting userSetting) {
        userSetting.setFindableByImageUrl(userSettingDTO.getFindableByImageUrl());
        userSetting.setWhoCanAddYouToGroupChat(userSettingDTO.getWhoCanAddYouToGroupChat());
        userSetting.setWhoCanSendYouNewMessage(userSettingDTO.getWhoCanSendYouNewMessage());
        return userSetting;
    }

}
