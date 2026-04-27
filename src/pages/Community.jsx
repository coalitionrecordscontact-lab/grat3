import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Send, Users, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

export default function Community() {
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  const { data: communityEntries, isLoading } = useQuery({
    queryKey: ["community-entries"],
    queryFn: async () => {
      const allEntries = await base44.entities.GratitudeEntry.list("-date", 50);
      return allEntries;
    },
    initialData: []
  });

  const handleInvite = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setInviting(true);
    try {
      await base44.users.inviteUser(email.trim(), "user");
      toast({
        title: "Invitation sent! 🎉",
        description: `${email} has been invited to join the app.`
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send the invitation. Please try again later.",
        variant: "destructive"
      });
    }
    setInviting(false);
  };

  // Group entries by user
  const groupedByUser = communityEntries.reduce((acc, entry) => {
    const user = entry.created_by || "Anonyme";
    if (!acc[user]) acc[user] = [];
    acc[user].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-14">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        
        <p className="text-[#1A215B] text-sm font-medium uppercase tracking-widest mb-2 font-body">
          Together
        </p>
        <h1 className="text-[#F9EFE4] text-3xl font-heading font-bold">
          Community
        </h1>
      </motion.div>

      {/* Invite Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#F9EFE4] rounded-3xl p-6 shadow-md mb-6">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#707AD6]/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-[#707AD6]" />
          </div>
          <div>
            <h3 className="text-[hsl(var(--background))] text-base font-semibold">Invite a friend

            </h3>
            <p className="text-[#B7A08C]/60 text-xs font-body">
              Share your positive moments together
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/50 border-[#B7A08C]/20 text-[#B7A08C] placeholder-[#B7A08C]/30 
                       rounded-xl focus:ring-[#707AD6]/30 font-body"

            onKeyDown={(e) => e.key === "Enter" && handleInvite()} />
          
          <Button
            onClick={handleInvite}
            disabled={inviting}
            className="bg-[#707AD6] hover:bg-[#3E47AB] text-[#F9EFE4] rounded-xl px-4 
                       transition-all duration-200 shrink-0">

            
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Community Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}>
        
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#F9EFE4]/60" />
          <h2 className="text-[#F9EFE4]/80 text-sm font-medium font-body uppercase tracking-widest">
            Community feed
          </h2>
        </div>

        {isLoading ?
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
          </div> :
        Object.keys(groupedByUser).length === 0 ?
        <div className="text-center py-12">
            <Heart className="w-12 h-12 text-[#F9EFE4]/20 mx-auto mb-4" />
            <p className="text-[#F9EFE4]/60 font-body">
              Invite your friends to see their positive moments here!
            </p>
          </div> :

        <div className="space-y-4">
            {Object.entries(groupedByUser).map(([userEmail, userEntries], idx) =>
          <motion.div
            key={userEmail}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-[#F9EFE4] rounded-3xl p-5 shadow-md">
            
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#707AD6] flex items-center justify-center">
                    <span className="text-[#F9EFE4] text-xs font-bold uppercase">
                      {userEmail.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#B7A08C] text-sm font-semibold font-body">
                      {userEmail}
                    </p>
                    <p className="text-[#B7A08C]/50 text-xs font-body">
                      {userEntries.length} day{userEntries.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Show latest entry */}
                {userEntries.slice(0, 1).map((entry) => {
              const events = [entry.event_1, entry.event_2, entry.event_3].filter(Boolean);
              return (
                <div key={entry.id}>
                      <p className="text-[#B7A08C]/50 text-xs mb-2 font-body">
                        {format(parseISO(entry.date), "MMMM d, yyyy")}
                      </p>
                      <div className="space-y-2">
                        {events.map((event, i) =>
                    <div key={i} className="flex items-start gap-2">
                            <Star className="w-3.5 h-3.5 text-[#707AD6] mt-0.5 flex-shrink-0 fill-[#707AD6]" />
                            <p className="text-[#B7A08C] text-sm font-body">{event}</p>
                          </div>
                    )}
                      </div>
                    </div>);

            })}
              </motion.div>
          )}
          </div>
        }
      </motion.div>
    </div>);

}