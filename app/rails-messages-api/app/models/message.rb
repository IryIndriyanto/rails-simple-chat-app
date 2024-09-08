class Message < ApplicationRecord
    after_create_commit { broadcst_message }

    private

    def broadcst_message
        ActionCable.server.broadcast("MessagesChannel", {
            id:,
            body:
        })
    end
end
