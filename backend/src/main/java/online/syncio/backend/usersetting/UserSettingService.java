package online.syncio.backend.usersetting;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserProfile;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.FileUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class UserSettingService {

    private final UserSettingRepository userSettingRepository;
    private final AuthUtils authUtils;
    private final FileUtils fileUtils;
    private final UserRepository userRepository;
    private final UserSettingMapper userSettingMapper;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final UserFollowRepository userFollowRepository;

    @Value("${firebase.storage.type}")
    private String storageType;

    @Value("${image-search-service.url}")
    private String url;


    public UserSettingDTO getUserSetting() {
        final UUID userId = authUtils.getCurrentLoggedInUserId();
        final Optional<UserSetting> userSettingOptional = userSettingRepository.findByUserId(userId);

        if(userSettingOptional.isEmpty()) {
            // If the user setting does not exist, create a new one
            User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));
            final UserSetting newUserSetting = new UserSetting();
            newUserSetting.setUser(user);
            newUserSetting.setWhoCanAddYouToGroupChat(WhoCanAddYouToGroupChat.EVERYONE);
            userSettingRepository.save(newUserSetting);
            return userSettingMapper.mapToDTO(newUserSetting, new UserSettingDTO());
        }
        else {
            return userSettingMapper.mapToDTO(userSettingOptional.get(), new UserSettingDTO());
        }
    }


    public UserSettingDTO updateWhoCanAddYouToGroupChat(final WhoCanAddYouToGroupChat whoCanAddYouToGroupChat) {
        final UUID userId = authUtils.getCurrentLoggedInUserId();
        final Optional<UserSetting> userSettingOptional = userSettingRepository.findByUserId(userId);

        if(userSettingOptional.isEmpty()) {
            // If the user setting does not exist, create a new one
            User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));
            final UserSetting newUserSetting = new UserSetting();
            newUserSetting.setUser(user);
            newUserSetting.setWhoCanAddYouToGroupChat(whoCanAddYouToGroupChat);
            newUserSetting.setWhoCanSendYouNewMessage(WhoCanSendYouNewMessage.EVERYONE);
            userSettingRepository.save(newUserSetting);
            return userSettingMapper.mapToDTO(newUserSetting, new UserSettingDTO());
        }
        else {
            UserSetting userSetting = userSettingOptional.get();
            userSetting.setWhoCanAddYouToGroupChat(whoCanAddYouToGroupChat);
            userSettingRepository.save(userSetting);
            return userSettingMapper.mapToDTO(userSetting, new UserSettingDTO());
        }
    }


    public UserSettingDTO updateWhoCanSendYouNewMessage(final WhoCanSendYouNewMessage whoCanSendMessage) {
        final UUID userId = authUtils.getCurrentLoggedInUserId();
        final Optional<UserSetting> userSettingOptional = userSettingRepository.findByUserId(userId);

        if(userSettingOptional.isEmpty()) {
            // If the user setting does not exist, create a new one
            User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));
            final UserSetting newUserSetting = new UserSetting();
            newUserSetting.setUser(user);
            newUserSetting.setWhoCanAddYouToGroupChat(WhoCanAddYouToGroupChat.EVERYONE);
            newUserSetting.setWhoCanSendYouNewMessage(whoCanSendMessage);
            userSettingRepository.save(newUserSetting);
            return userSettingMapper.mapToDTO(newUserSetting, new UserSettingDTO());
        }
        else {
            UserSetting userSetting = userSettingOptional.get();
            userSetting.setWhoCanSendYouNewMessage(whoCanSendMessage);
            userSettingRepository.save(userSetting);
            return userSettingMapper.mapToDTO(userSetting, new UserSettingDTO());
        }
    }


    public Boolean checkWhoCanSendYouNewMessage(final UUID roomId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        // Get the other user in the room
        final List<MessageRoomMember> messageRoomMembers = messageRoomMemberRepository.findByMessageRoomIdOrderByDateJoined(roomId);
        final UUID userId = messageRoomMembers.stream()
                .filter(messageRoomMember -> !messageRoomMember.getUser().getId().equals(currentUserId))
                .map(messageRoomMember -> messageRoomMember.getUser().getId())
                .findFirst()
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", roomId.toString()));

        final Optional<UserSetting> userSettingOptional = userSettingRepository.findByUserId(userId);
        if(userSettingOptional.isEmpty()) {
            // If the user setting does not exist, create a new one
            User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));
            final UserSetting newUserSetting = new UserSetting();
            newUserSetting.setUser(user);
            newUserSetting.setWhoCanAddYouToGroupChat(WhoCanAddYouToGroupChat.EVERYONE);
            newUserSetting.setWhoCanSendYouNewMessage(WhoCanSendYouNewMessage.EVERYONE);
            userSettingRepository.save(newUserSetting);
            return true;
        }
        else {
            UserSetting userSetting = userSettingOptional.get();
            // check if the current user can send a new message to the other user
            final WhoCanSendYouNewMessage whoCanSendYouNewMessage = userSetting.getWhoCanSendYouNewMessage();
            if(whoCanSendYouNewMessage == null) {
                return true;
            }
            if(whoCanSendYouNewMessage.equals(WhoCanSendYouNewMessage.ONLY_PEOPLE_YOU_FOLLOW)) {
                return userFollowRepository.existsByTargetIdAndActorId(currentUserId, userId);
            }
            else return !whoCanSendYouNewMessage.equals(WhoCanSendYouNewMessage.NO_ONE);
        }
    }


    public String updateImageSearch(MultipartFile file) {
        // Get the current logged in user
        final UUID id = authUtils.getCurrentLoggedInUserId();
        if(id == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "User not logged in", null);
        }
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));

        // Check if the user setting exists
        final Optional<UserSetting> userSetting = userSettingRepository.findByUserId(id);
        if (userSetting.isEmpty()) {
            // If not, create a new user setting
            UserSetting newUserSetting = new UserSetting();
            newUserSetting.setUser(user);
            newUserSetting.setFindableByImageUrl("image_search_" + user.getId() + ".jpg");
            newUserSetting.setWhoCanAddYouToGroupChat(WhoCanAddYouToGroupChat.EVERYONE);
            newUserSetting.setWhoCanSendYouNewMessage(WhoCanSendYouNewMessage.EVERYONE);
            userSettingRepository.save(newUserSetting);
        }
        else if(userSetting.get().getFindableByImageUrl() == null) {
            // If the user setting exists but the image is not set
            userSetting.get().setFindableByImageUrl("image_search_" + user.getId() + ".jpg");
            userSettingRepository.save(userSetting.get());
        }

        // Store the file
        try {
            return fileUtils.storeFile(file, "user-setting", true);
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not store file", e);
        }
    }


    public boolean deleteImageSearch() {
        // Get the current logged in user
        final UUID id = authUtils.getCurrentLoggedInUserId();
        if(id == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "User not logged in", null);
        }

        // Check if the user setting exists
        final Optional<UserSetting> userSetting = userSettingRepository.findByUserId(id);
        if (userSetting.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "User setting not found", null);
        }

        // Delete the file
        try {
            boolean isDeleted = fileUtils.deleteFile("user-setting/" + userSetting.get().getFindableByImageUrl());
            if(isDeleted) {
                // Delete the user setting
                userSetting.get().setFindableByImageUrl(null);
                userSettingRepository.save(userSetting.get());
                return true;
            }
            else {
                throw new AppException(HttpStatus.BAD_REQUEST, "Could not delete file", null);
            }
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not delete file", e);
        }
    }


    public List<UserProfile> searchByImage(MultipartFile file) {
        Gson gson = new Gson();
        RestTemplate restTemplate = new RestTemplate();

        // find all the images in the database
        List<UserSetting> userSettings = userSettingRepository.findAllByFindableByImageUrlNotNullAndUserIsActive();

        if (userSettings.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "No matching images found", null);
        }

        // Convert known faces to a list of maps with id and url
        List<Map<String, String>> knownFaces = userSettings.stream()
                .map(userSetting -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", userSetting.getUser().getId().toString());
                    final String imageUrl = userSetting.getImageUrl(storageType);
                    if(imageUrl != null) {
                        map.put("url", imageUrl);
                    }
                    return map;
                })
                .collect(Collectors.toList());

        // Convert knownFaces to JSON
        String knownFacesJson = gson.toJson(knownFaces);

        // Create multipart body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("known_images", knownFacesJson);
        body.add("person_image", file.getResource());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // Send request
            ResponseEntity<String> response = restTemplate.exchange(
                    url + "/process_images",
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject jsonObject = new JSONObject(response.getBody());

                // Extract matching IDs from the response
                JSONArray jsonArray = jsonObject.getJSONArray("matching_ids");
                // Convert to list of strings
                Set<String> matchingIds = IntStream.range(0, jsonArray.length())
                        .mapToObj(jsonArray::getString)
                        .collect(Collectors.toSet());

                // filter the userSettings by the matching IDs
                List<UserSetting> matchingUserSettings = userSettings.stream()
                        .filter(userSetting -> matchingIds.contains(userSetting.getUser().getId().toString()))
                        .toList();

                // Map to userprofile
                return matchingUserSettings.stream()
                        .map(userSetting -> userSettingMapper.mapToUserProfile(userSetting, new UserProfile()))
                        .toList();
            }
        } catch (HttpClientErrorException.BadRequest | HttpClientErrorException.NotFound e) {
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                JsonNode jsonNode = objectMapper.readTree(e.getResponseBodyAsString());
                String errorMessage = jsonNode.get("error").asText();
                throw new AppException(HttpStatus.BAD_REQUEST, errorMessage, e);
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
        return null;
    }

}
