package com.synclink.repository;

import com.synclink.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationTypeAndSenderIdAndReceiverIdOrConversationTypeAndSenderIdAndReceiverIdOrderBySentAtAsc(
            String conversationType1,
            Long senderId,
            Long receiverId,
            String conversationType2,
            Long senderId2,
            Long receiverId2
    );

    List<Message> findByConversationTypeOrderBySentAtAsc(
            String conversationType
    );
}