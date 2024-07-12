package online.syncio.backend.post;

import online.syncio.backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    /**
     * Get the posts of the user with the UUID. Also check if the current user can see the post.
     * @param userId
     * @param currentUserId
     * @return
     */
    @Query(value = "SELECT p.*, ucf.user_id AS ucf_user_id " +
            "FROM post p " +
            "LEFT JOIN user_close_friend ucf ON p.user_id = ucf.user_id " +
            "WHERE p.flag = true " +
            "AND p.user_id = :userId " +
            "AND (p.user_id = :currentUserId OR " +
            "p.visibility = 'PUBLIC' OR " +
            "(p.visibility = 'CLOSE_FRIENDS' AND ucf.close_friend_id = :currentUserId) OR " +
            "(p.visibility = 'PRIVATE' AND p.user_id = :currentUserId)) " +
            "ORDER BY p.created_date DESC", nativeQuery = true)
    List<Post> findPostsByUser(@Param("userId") UUID userId, @Param("currentUserId") UUID currentUserId);

    /**
     * This method is used to get the caption of a post by its id.
     * @param id the post id
     * @return the caption of the post
     */
    @Query(value = "SELECT caption FROM post WHERE id = :id", nativeQuery = true)
    String getCaptionById(UUID id);

    /**
     * This method is used to get the first photo of a post by its id.
     * @param postId the post id
     * @return the first photo of the post
     */
    @Query(value = "SELECT url FROM post_photos WHERE post_id = :postId LIMIT 1", nativeQuery = true)
    String findFirstPhotoIdByPostId(UUID postId);

    long countByCreatedByAndCreatedDateAfter(User user, LocalDateTime date);

    long countByCreatedBy_Id (UUID id);

    Page<Post> findByReportsIsNotNullAndFlagTrue(Pageable pageable);
    Page<Post> findByReportsIsNotNullAndFlagFalse(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.createdDate >= :startDate")
    List<Post> findAllPostsSince(@Param("startDate") LocalDateTime startDate);

    /**
     * Get the posts of the users that the user with the UUID follows.
     * The user with the UUID is able to see the posts of the users that the user follows.
     * Flag is true and the post is created within the last daysAgo days.
     *
     * @param pageable
     * @param userId the user id of the user that is logged in
     * @param users the users that the user with the UUID follows
     * @param daysAgo the number of days ago that the post was created
     * @return
     */
    @Query(value = "SELECT p.*, ucf.user_id AS ucf_user_id " +
        "FROM post p " +
            "LEFT JOIN user_close_friend ucf ON p.user_id = ucf.user_id " +
            "WHERE p.flag = true " +
                "AND p.user_id IN (:users) " +
                "AND p.created_date >= :daysAgo " +
                "AND (p.user_id = :userId OR " +
                    "p.visibility = 'PUBLIC' OR " +
                    "(p.visibility = 'CLOSE_FRIENDS' AND ucf.close_friend_id = :userId) OR " +
                    "(p.visibility = 'PRIVATE' AND p.user_id = :userId)) " +
                "ORDER BY p.created_date DESC", nativeQuery = true)
    Page<Post> findPostsByUserFollowing(Pageable pageable, @Param("userId") UUID userId, @Param("users") Set<UUID> users, @Param("daysAgo") LocalDateTime daysAgo);

    /**
     * Find posts based on user interests.
     * It selects all posts where the flag is true,
     * visibility is public, and the post's user_id is not in the following list.
     * It also checks if the post's id is not in the postIds list and if the post's keywords match the provided keywords.
     * The results are ordered by the length of the replaced keywords in descending order.
     *
     * @param pageable
     * @param following the users that the current user is following.
     * @param postIds the ids of the posts that the current user has already seen.
     * @param keywords the keywords to match in the posts.
     * @return
     */
    @Query(value = "SELECT * " +
            "FROM post p " +
            "WHERE p.flag = true " +
            "AND p.visibility = 'PUBLIC' " +
            "AND (COALESCE(:following) IS NULL OR p.user_id NOT IN :following) " +
            "AND (COALESCE(:postIds) IS NULL OR p.id NOT IN :postIds) " +
            "AND (COALESCE(:keywords) IS NULL OR p.keywords REGEXP :keywords) " +
            "ORDER BY LENGTH(REPLACE(p.keywords, COALESCE(:keywords, ''), '')) DESC", nativeQuery = true)
    Page<Post> findPostsByUserInterests(Pageable pageable, @Param("following") Set<UUID> following, @Param("postIds") Set<UUID> postIds, @Param("keywords") String keywords);

    /**
     * Find posts for the feed.
     * It selects all posts where the flag is true,
     * visibility is public, and the post's id is not in the postIds list.
     * The results are ordered by the created_date in descending order.
     *
     * @param postIds the ids of the posts that the current user has already seen.
     * @param
     * @return
     */
    @Query(value = "SELECT * " +
            "FROM post p " +
            "WHERE p.flag = true " +
            "AND p.visibility = 'PUBLIC' " +
            "AND (COALESCE(:postIds) IS NULL OR p.id NOT IN :postIds) " +
            "ORDER BY p.created_date DESC", nativeQuery = true)
    Page<Post> findPostsFeed(@Param("postIds") Set<UUID> postIds, Pageable pageable);

    @Query(value = "SELECT * " +
            "FROM post p " +
            "WHERE p.flag = true " +
            "AND p.visibility = :visibility " +
            "AND p.user_id = :userId " +
            "ORDER BY p.created_date DESC", nativeQuery = true)
    List<Post> findPostsByVisibilityAndUserId(@Param("visibility") String visibility, @Param("userId") UUID userId);

}
