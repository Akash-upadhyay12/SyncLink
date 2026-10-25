package com.synclink.service;

import com.synclink.entity.Message;
import com.synclink.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long user1, Long user2) {
        return messageRepository
                .findByConversationTypeAndSenderIdAndReceiverIdOrConversationTypeAndSenderIdAndReceiverIdOrderBySentAtAsc(
                        "PRIVATE", user1, user2,
                        "PRIVATE", user2, user1
                );
    }

    public List<Message> getGroupMessages() {
        return messageRepository
                .findByConversationTypeOrderBySentAtAsc("GROUP");
    }
}